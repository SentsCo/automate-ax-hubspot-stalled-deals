import { automation, onSchedule, t } from "automate.ax"
import { hubspot } from "automate.ax/hubspot"
import { slack } from "automate.ax/slack"

export default automation(
  "Review open HubSpot deals with no recent CRM updates",
  {
    parameters: [
      { label: "HubSpot portal ID", name: "hubspotPortalId", type: "text" },
      { label: "HubSpot pipeline ID", name: "hubspotPipelineId", type: "text" },
      { label: "Closed won stage ID", name: "closedWonStageId", type: "text" },
      {
        label: "Closed lost stage ID",
        name: "closedLostStageId",
        type: "text",
      },
      {
        label: "Slack conversation ID",
        name: "slackConversationId",
        type: "text",
      },
    ],
  },
  ({ parameters }) => {
    const tick = onSchedule({ schedule: "0 9 * * 1", timeZone: "UTC" })
    const cutoff = tick.scheduledAt.transform((date) =>
      String(date.getTime() - 14 * 24 * 60 * 60 * 1000),
    )

    const deals = hubspot
      .searchDeals({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "pipeline",
                operator: "EQ",
                value: parameters.hubspotPipelineId,
              },
              {
                propertyName: "hs_lastmodifieddate",
                operator: "LT",
                value: cutoff,
              },
              {
                propertyName: "dealstage",
                operator: "NOT_IN",
                values: [
                  parameters.closedWonStageId,
                  parameters.closedLostStageId,
                ],
              },
            ],
          },
        ],
        properties: ["dealname", "dealstage", "hs_lastmodifieddate"],
        limit: 100,
      })
      .filter(({ records }) => records.length > 0)

    const lines = deals.transform(({ records }) =>
      records
        .map((deal) => {
          const name = deal.properties.find(
            (property) => property.name === "dealname",
          )?.value
          return `• ${name || "Untitled deal"}: https://app.hubspot.com/contacts/${parameters.hubspotPortalId}/deal/${deal.id}`
        })
        .join("\n"),
    )

    slack.sendMessage({
      conversation: parameters.slackConversationId,
      text: t`Open deals with no CRM updates in 14 days (first 100 matches):\n${lines}\nReview each deal before deciding on a follow-up.`.transform(
        escapeSlackText,
      ),
      unfurlLinks: false,
    })
  },
)

/** Keeps provider text from becoming Slack mentions or control markup. */
function escapeSlackText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}
