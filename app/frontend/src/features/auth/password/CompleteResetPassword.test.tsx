import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CHANGE_PASSWORD_ERROR,
  CHANGE_PASSWORD_PROGRESS,
  CHANGE_PASSWORD_SUCCESS,
  CLICK_LOGIN,
  LOGIN_PAGE,
} from "features/auth/constants";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { Route, Switch } from "react-router-dom";
import { loginRoute, resetPasswordRoute } from "routes";
import { service } from "service/index";
import { getHookWrapperWithClient } from "test/hookWrapper";
import { MockedService } from "test/utils";

import CompleteResetPassword from "./CompleteResetPassword";

const completePasswordResetMock = service.account
  .completePasswordReset as MockedService<
  typeof service.account.completePasswordReset
>;

function renderPage() {
  const { wrapper } = getHookWrapperWithClient({
    initialRouterEntries: [`${resetPasswordRoute}/P4w0rdR3seTtok3n`],
  });

  render(
    <Switch>
      <Route path={`${resetPasswordRoute}/:resetToken`}>
        <CompleteResetPassword />
      </Route>
      <Route path={loginRoute}>{LOGIN_PAGE}</Route>
    </Switch>,
    { wrapper }
  );
}

describe("CompleteResetPassword", () => {
  it("shows the loading state on initial load", async () => {
    completePasswordResetMock.mockImplementation(
      () => new Promise(() => void 0)
    );
    renderPage();

    expect(await screen.findByText(CHANGE_PASSWORD_PROGRESS)).toBeVisible();
  });

  describe("when the reset password completes successfully", () => {
    beforeEach(() => {
      completePasswordResetMock.mockResolvedValue(new Empty());
      renderPage();
    });

    it("shows the success alert", async () => {
      const successAlert = await screen.findByRole("alert");
      expect(successAlert).toBeVisible();
      expect(successAlert).toHaveTextContent(CHANGE_PASSWORD_SUCCESS);
      expect(completePasswordResetMock).toHaveBeenCalledTimes(1);
      expect(completePasswordResetMock).toHaveBeenLastCalledWith(
        "P4w0rdR3seTtok3n"
      );
    });

    it("shows a link that takes you to the login page when clicked", async () => {
      userEvent.click(await screen.findByRole("link", { name: CLICK_LOGIN }));

      expect(await screen.findByText(LOGIN_PAGE)).toBeInTheDocument();
    });
  });

  it("shows an error alert if the reset password process failed to complete", async () => {
    jest.spyOn(console, "error").mockReturnValue(undefined);
    completePasswordResetMock.mockRejectedValue(new Error("Invalid token"));
    renderPage();

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toBeVisible();
    expect(errorAlert).toHaveTextContent(
      `${CHANGE_PASSWORD_ERROR}Invalid token`
    );
  });
});
