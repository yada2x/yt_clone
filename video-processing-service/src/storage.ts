import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "yada2x-raw-videos"; // Download path from GCS
const processedVideoBucketName = "yada2x-processed-videos"; // Upload path to GCS

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * 
 * @param rawVideoName - Name of file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - Name of file converted to {@link localProcessedVideoPath}.
 * @returns - A Promise that resolves when the video is processed.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360")
        .on("end", () => {
            console.log("Video processing finished successfully.");
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occured: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/**
 * 
 * @param fileName - The file name to download from the {@link rawVideoBucketName} bucket
 * into the {@link localRawVideoPath} folder.
 * @returns - a Promise that resolves when the file is downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({destination: `${localRawVideoPath}/${fileName}`});
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`
    );
}

/**
 * 
 * @param fileName - The file name to upload from the {@link localProcessedVideoPath} folder
 * into the {@link processedVideoBucketName}.
 * @returns - a Promise that resolves when the file is uploaded.
 */
export async function uploadProcessedVideo (fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });
    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
      );
    
    await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}
 

/**
 * 
 * @param filePath 
 * @returns 
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(`File ${filePath} does not exist.`);
        } else {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}.`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}.`);
                    resolve();
                }
            })
        }

    })
}

function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true });
        console.log(`Directory created at ${dirPath}`);
    }
}