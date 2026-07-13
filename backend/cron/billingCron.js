import cron from "node-cron";

import CompanySubscription from "../models/companySubscriptionModel.js";

import {
  createInvoice,
} from "../services/billingService.js";


// =====================================================
// DAILY BILLING CRON
// Runs every day at 12:00 AM
// =====================================================

const startBillingCron = () => {

  cron.schedule(
    "0 0 * * *",
    async () => {

      console.log(
        "========== BILLING CRON START =========="
      );


      try {

        const today = new Date();


        const subscriptions =
          await CompanySubscription.find({
            status: "active",

            nextBillingDate: {
              $lte: today,
            },
          });


        console.log(
          "Subscriptions Due :",
          subscriptions.length
        );


        for (const subscription of subscriptions) {

          try {

            await createInvoice(
              subscription.company
            );


            console.log(
              "Invoice generated for:",
              subscription.company
            );


          } catch(error) {

            console.error(
              "Invoice generation failed:",
              error.message
            );

          }

        }


      } catch(error) {

        console.error(
          "Billing Cron Error:",
          error.message
        );

      }


      console.log(
        "========== BILLING CRON END =========="
      );

    }
  );

};


export default startBillingCron;