import { google } from "googleapis";
import fs from "fs";
import "dotenv/config";
import getMimeType from "mime-types";
import { logger } from "./logger.js";

const auth = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

class GoogleDrive {
  constructor() {
    this.drive = google.drive({
      version: "v3",
      auth,
    });
  }
  // set folder to save media files, if not exist create it else use that folder
  async selectFolder() {
    const parentFolderName = "Website Media Files";
    const childFolderName = "Uploads";

    // step 1 - check if parent folder exist if not create it
    const parentFolder = await this.drive.files.list({
      q: `name='${parentFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    });

    let parentFolderId;
    if (parentFolder.data.files.length) {
      parentFolderId = parentFolder.data.files[0].id;
    } else {
      const parentFolder = await this.drive.files.create({
        requestBody: {
          name: parentFolderName,
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      });
      parentFolderId = parentFolder.data.id;
    }

    //step 2 - check if child folder exist
    const childFolder = await this.drive.files.list({
      q: `name='${childFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${parentFolderId}' in parents`,
    });

    let childFolderId;
    if (childFolder.data.files.length) {
      childFolderId = childFolder.data.files[0].id;
    } else {
      const childFolder = await this.drive.files.create({
        requestBody: {
          name: childFolderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentFolderId],
        },
        fields: "id",
      });
      childFolderId = childFolder.data.id;
    }
    return childFolderId;
  }

  async uploadFile(localFilePath) {
    try {
      const mimeType = getMimeType.lookup(localFilePath);
      const name =
        localFilePath.split("/")[localFilePath.split("/").length - 1];

      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType,
          parents: [await this.selectFolder()],
        },

        media: {
          mimeType,
          body: fs.createReadStream(localFilePath),
        },
      });

      return await this.generatePublicUrl(response.data);
    } catch (error) {
      logger.error("Error uploading file: ", error);
    }
  }

  async deleteFile(fileUrl) {
    const fileId = await this.getFileId(fileUrl);
    try {
      const response = await this.drive.files.delete({
        fileId,
      });
   
    } catch (error) {
      logger.error("Error deleting file: ", error);
    }
  }

  async generatePublicUrl(response) {
    const fileId = response.id;
    const mimeType = response.mimeType;
    try {
      const response = await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      

      return {
        // url: `https://drive.google.com/uc?export=download&id=${fileId}`,
        url: `https://drive.google.com/uc?id=${fileId}`,
        mimeType,
        fileId,
      };
    } catch (error) {
      logger.error("Error generating public url: ", error);
    }
  }
  async getFileId(url) {
    try {
      const fileId = url.split("/")[5];
      return fileId;
    } catch (error) {
      logger.error("Error getting file id: ", error);
    }
  }
}
export const googleDrive = new GoogleDrive();
