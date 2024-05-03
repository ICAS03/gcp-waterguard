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
        const tableId = "sensorData2";
        const timestamp = moment().tz("Asia/Singapore").format();

        const flood = 70;
        const high = 75;
        const medium = 80;
        const low = 94;

        let status;
        if (newValue <= flood) {
          status = "flood";
        } else if (newValue >= flood && newValue <= high ){
          status = 'high'
        } else if (newValue >= high && newValue < medium) {
          status = "medium";
        } else if (newValue >= medium && newValue <= low) {
          status = "low";
        } else {
          status = "very low";
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
