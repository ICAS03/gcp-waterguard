// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {BigQuery} = require("@google-cloud/bigquery");
const moment = require("moment-timezone");

admin.initializeApp();

exports.syncToBigQuery = functions.database
    .ref("/WaterLvl/{itemId}")
    .onWrite(async (change, context) => {
      const newValue = change.after.val();
      const itemId = context.params.itemId;

      try {
        const bigquery = new BigQuery();
        const datasetId = "waterguard_dataset";
        const tableId = "sensorlevel";
        const timestamp = moment().tz("Asia/Singapore").format();

        const verydangerous = 170;
        const belownormal = 150;
        const dangerous = 160;

        let status;
        if (newValue > verydangerous) {
          status = "very dangerous";
        } else if (newValue > dangerous) {
          status = "dangerous";
        } else if (newValue > belownormal) {
          status = "normal";
        } else {
          status = "below normal";
        }

        const row = {
          itemId,
          data: newValue,
          timestamp,
          status,
        };

        console.log("Row to be inserted", row);
        await bigquery.dataset(datasetId).table(tableId).insert([row]);

        console.log("Data synchronized to BigQuery successfully");
        return null;
      } catch (error) {
        console.error("Error syncing data to BigQuery:", error);

        if (error.name === "PartialFailureError" && error.errors) {
          error.errors.forEach((err) => {
            console.error("BigQuery Insert Error:", err);
          });
        }

        return null;
      }
    });
