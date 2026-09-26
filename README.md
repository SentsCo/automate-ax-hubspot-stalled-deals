# Review HubSpot deals with no CRM updates in 14 days

An open deal can sit untouched in the CRM long enough that nobody remembers to check what happened next.

Every Monday at 09:00 UTC, this example searches one HubSpot pipeline for deals outside its closed-won and closed-lost stages whose records have not been modified for 14 days. It sends the first 100 matching deals to a Slack channel as names and direct links. The team can open each record and decide whether it needs a follow-up.

A quiet CRM record is a useful review cue, but it is not proof that sales activity stopped. A rep might have called the buyer without logging it, or a property update might make a deal look fresh when the buyer has not heard from anyone. The digest gives the team a starting list; a person checks the actual history before acting.

## Set it up with a coding agent

Copy the setup prompt from [the article](https://automate.ax/articles/hubspot-stalled-deals) into your coding agent. The agent creates the Automate.ax project, asks for your choices, guides account authorization, checks the automation, and deploys it. You do not need to clone this repository yourself when using the prompt.

You'll choose:

- The HubSpot portal to review and its portal ID for deal links.
- The pipeline ID and its closed-won and closed-lost stage IDs to exclude.
- The Slack channel where the weekly list should go.
- Account authorization.

## Manual setup

If you prefer to set it up yourself:

```sh
git clone https://github.com/SentsCo/automate-ax-hubspot-stalled-deals.git
cd automate-ax-hubspot-stalled-deals
bun install
bunx automate.ax login
bunx automate.ax init
bun run typecheck
bunx automate.ax deploy
```

Connect the accounts requested by Automate.ax when you deploy. The platform stores credentials outside this repository. Set any project parameters requested by the automation, then review the read and write operations before turning it on.

## Check a run

Check one open deal last modified more than 14 days ago, one recently modified deal, and one closed deal. Confirm only the old open deal appears in the Slack list, and that its link opens the intended HubSpot portal.

## Limits

- The filter uses hs_lastmodifieddate, which measures CRM record changes rather than sales activity. Review the deal before concluding it has stalled.
- The search returns only the first 100 matches. Add pagination if your portal has more qualifying deals.
- The example checks one pipeline and does not assign an owner, create a task, or email a prospect. Ask the agent to add those rules if your review process needs them.

The workflow responds to [a real problem described by A HubSpot discussion about active-deal follow-up](https://www.reddit.com/r/hubspot/comments/1rdn7tt/how_do_you_handle_followup_cadence_on_active_deals/). The public report informed the example; it is not an endorsement of this implementation.
