import { TabContext, TabPanel } from "@material-ui/lab";
import React from "react";
import { useHistory, useParams } from "react-router";

import NotificationBadge from "../../components/NotificationBadge";
import PageTitle from "../../components/PageTitle";
import TabBar from "../../components/TabBar";
import { connectionsRoute } from "../../routes";
import useNotifications from "../useNotifications";
import { FriendsTab } from "./friends";

function FriendsNotification() {
  const { data } = useNotifications();

  return (
    <NotificationBadge count={data?.pendingFriendRequestCount}>
      Friends
    </NotificationBadge>
  );
}

const labels = {
  friends: <FriendsNotification />,
};

type ConnectionType = keyof typeof labels;

function ConnectionsPage() {
  const history = useHistory();
  const { type = "friends" } = useParams<{ type: string }>();
  const connectionType = type in labels ? (type as ConnectionType) : "friends";

  return (
    <>
      <PageTitle>My Connections</PageTitle>
      <TabContext value={connectionType}>
        <TabBar
          value={connectionType}
          setValue={(newType) =>
            history.push(
              `${connectionsRoute}/${newType !== "friends" ? newType : ""}`
            )
          }
          labels={labels}
        />
        <TabPanel value="friends">
          <FriendsTab />
        </TabPanel>
      </TabContext>
    </>
  );
}

export default ConnectionsPage;
