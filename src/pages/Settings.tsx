import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { staticGetUser } from "@/redux/user/selectors";
import { useAppDispatch, resetAllSlices } from "@/redux";
import { updateUserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";
import { fetchUser, SubscriptionStatus } from "@/redux/user";
import { useDialog } from "@/providers/dialog-provider";
import { useNavigate } from "react-router-dom";
import { useStytch } from "@stytch/react";
import { isEqual } from "lodash";
import { useAppSelector } from "@/redux";
import { getTokens } from "@/redux/tokens/selectors";

// ---------------------------------------------------------------------------
// Profile tab
// ---------------------------------------------------------------------------
const ProfileTab: React.FC = () => {
  const user = useSelector(staticGetUser);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);

  const isDirty =
    firstName !== (user?.firstName ?? "") || lastName !== (user?.lastName ?? "");

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user?.firstName, user?.lastName]);

  useEffect(() => {
    dispatch(fetchUser(user?.phone_number ?? ""));
  }, [])

  const handleSave = async () => {
    if (!user || !isDirty) return;
    setSaving(true);
    const res = await dispatch(updateUserProfile({ user, firstName, lastName }));
    const payload = res.payload as any;
    if (payload?.success) {
      toast({ title: "Profile updated!" });
    } else {
      toast({ title: "Failed to update profile", description: String(payload?.error ?? "") });
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-md relative min-h-[300px] mx-auto">
      <div className="flex items-center gap-4">
        <UserAvatar firstName={user?.firstName ?? ""} size="lg" />
        <div className="flex flex-col">
          <p className="font-medium text-lg">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-muted-foreground">{user?.phone_number}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-muted-foreground">First name</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-muted-foreground">Last name</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Phone number</label>
          <Input value={user?.phone_number ?? ""} disabled readOnly />
        </div>
      </div>

      {isDirty && (
        <div className="absolute bottom-0 right-0">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Delete account confirmation modal content
// ---------------------------------------------------------------------------

const DELETE_PHRASE = "I want to delete my account";

const DeleteAccountModalContent: React.FC = () => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const confirmed = isEqual(value, DELETE_PHRASE);

  return (
    <div className="flex flex-col gap-4 relative min-h-[180px] px-4">
      <p className="text-sm font-medium">are you sure you want to delete your account?</p>
      <p className="text-sm text-muted-foreground">
        type <span className="font-mono text-foreground">'{DELETE_PHRASE}'</span> in the input below ⤓
      </p>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={DELETE_PHRASE}
      />
      <div className="flex flex-row-reverse">
        <Button variant="destructive" disabled={!confirmed}>
          Delete Account
        </Button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Account tab
// ---------------------------------------------------------------------------
const AccountTab: React.FC = () => {
  const user = useSelector(staticGetUser);
  const tokens = useAppSelector(getTokens);
  const { dialog } = useDialog();
  const navigate = useNavigate();
  const stytch = useStytch();
  const dispatch = useAppDispatch();
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const handleSignOut = async () => {
    await stytch.session.revoke();
    dispatch(resetAllSlices);
    navigate("/");
  };

  const openDeleteModal = () => {
    dialog(<DeleteAccountModalContent />, {
      title: "Delete Account",
    });
  };

  const handleCancelSubscription = async () => {
    setCancellingSubscription(true);
    try {
      const response = await fetch("http://localhost:8080/api/checkout/stripe/portal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens?.session_jwt}`,
        },
      });
      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } finally {
      setCancellingSubscription(false);
    }
  };

  const isSubscribed = user?.subscription_status != null;

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Subscription</h3>
        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          {isSubscribed && user?.subscription_status === SubscriptionStatus.Basic ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Basic plan</span>
                <span className="font-medium">$7 / month</span>
              </div>
            </div>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">No active subscription</span>
              <Button onClick={() => navigate("/checkout")} size="sm">Subscribe!</Button>
            </>
          )}
        </div>
        {isSubscribed && user?.subscription_status !== null && <Button
          size="sm"
          variant="outline"
          className="w-fit"
          disabled={cancellingSubscription}
          onClick={handleCancelSubscription}
        >
          {cancellingSubscription ? "Redirecting..." : "Cancel subscription"}
        </Button>}
      </div>

      <Separator />
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-destructive">Danger zone</h3>
        <Button variant="destructive" className="w-fit" onClick={openDeleteModal}>
          Delete account
        </Button>
        <Button variant="outline" className="w-fit" onClick={handleSignOut}>
          Log out
        </Button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const Settings = () => {
  return (
    <Layout>
      <div className="gap-6 pt-4">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="pt-6 px-[15vw]">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="account" className="pt-6 px-[15vw]">
            <AccountTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
