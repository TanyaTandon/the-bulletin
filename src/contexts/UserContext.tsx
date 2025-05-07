
import { useAppDispatch } from "@/redux";
import { fetchBulletins, fetchUser } from "@/redux/user";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
// import { useClerk, useUser as useClerkUser } from "@clerk/clerk-react";

export type ContentType = "picture" | "note" | "writing" | "calendar";

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: {
    personaId: string;
    personaName: string;
  };
  groupId?: string;
}

export interface Persona {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Group {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: Persona[];
}

export interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: "pending" | "accepted" | "rejected";
}

interface UserContextType {
  personas: Persona[];
  groups: Group[];
  contents: Content[];
  activePersona: Persona | null;
  activeGroup: Group | null;
  friends: Friend[];
  friendRequests: FriendRequest[];
  addPersona: (persona: Omit<Persona, "id">) => void;
  addGroup: (group: Omit<Group, "id">) => void;
  addContent: (content: Omit<Content, "id" | "createdAt">) => void;
  setActivePersona: (personaId: string | null) => void;
  setActiveGroup: (groupId: string | null) => void;
  getPersonaById: (id: string) => Persona | undefined;
  getGroupById: (id: string) => Group | undefined;
  addFriend: (friend: Omit<Friend, "id">) => void;
  addFriendRequest: (request: Omit<FriendRequest, "id">) => void;
  updateFriendRequestStatus: (
    id: string,
    status: "accepted" | "rejected"
  ) => void;
  importContacts: (contacts: Array<{ name: string; phone: string }>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialPersonas: Persona[] = [
  {
    id: "p1",
    name: "Default Persona",
    avatar: "",
    bio: "This is your default persona",
  },
];

const initialGroups: Group[] = [];
const initialContents: Content[] = [];
const initialFriends: Friend[] = [
  { id: "f1", name: "Mahika", phone: "+1234567890" },
  { id: "f2", name: "Tanya", phone: "+1987654321" },
  { id: "f3", name: "Lila", phone: "+1122334455" },
  { id: "f4", name: "Adi", phone: "+1567890123" },
  { id: "f5", name: "Nigel", phone: "+1654321098" },
];
const initialFriendRequests: FriendRequest[] = [
  { id: "fr1", name: "Alex", phone: "+1234509876", status: "pending" },
  { id: "fr2", name: "Jordan", phone: "+1456789012", status: "pending" },
  { id: "fr3", name: "Jamie", phone: "+1567890123", status: "pending" },
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // const { user } = useClerkUser();
  // const { isSignedIn, user } = useClerk();

  const dispatch = useAppDispatch();

  // useEffect(() => {
    // console.log(user);
    // if (user) {
    //   dispatch(
    //     fetchUser(user.primaryPhoneNumber.phoneNumber.split("+1")[1])
    //   ).then((response) => {
    //     console.log(response.payload);
    //     if (response.payload && typeof response.payload === 'object' && 'bulletins' in response.payload && Array.isArray(response.payload.bulletins) && response.payload.bulletins.length > 0) {
    //       dispatch(fetchBulletins());
    //     }
    //   });
    // }
  // }, [user]);

  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [activePersona, setActivePersonaState] = useState<Persona | null>(
    initialPersonas[0]
  );
  const [activeGroup, setActiveGroupState] = useState<Group | null>(null);
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(
    initialFriendRequests
  );

  const addPersona = (persona: Omit<Persona, "id">) => {
    const newPersona = {
      ...persona,
      id: `p${personas.length + 1}`,
    };
    setPersonas([...personas, newPersona]);
  };

  const addGroup = (group: Omit<Group, "id">) => {
    const newGroup = {
      ...group,
      id: `g${groups.length + 1}`,
    };
    setGroups([...groups, newGroup]);
  };

  const addContent = (content: Omit<Content, "id" | "createdAt">) => {
    const newContent = {
      ...content,
      id: `c${contents.length + 1}`,
      createdAt: new Date(),
    };
    setContents([...contents, newContent]);
  };

  const setActivePersona = (personaId: string | null) => {
    if (!personaId) {
      setActivePersonaState(null);
      return;
    }
    const persona = personas.find((p) => p.id === personaId);
    if (persona) {
      setActivePersonaState(persona);
    }
  };

  const setActiveGroup = (groupId: string | null) => {
    if (!groupId) {
      setActiveGroupState(null);
      return;
    }
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setActiveGroupState(group);
    }
  };

  const getPersonaById = (id: string) => {
    return personas.find((p) => p.id === id);
  };

  const getGroupById = (id: string) => {
    return groups.find((g) => g.id === id);
  };

  const addFriend = (friend: Omit<Friend, "id">) => {
    const newFriend = {
      ...friend,
      id: `f${friends.length + 1}`,
    };
    setFriends([...friends, newFriend]);
  };

  const addFriendRequest = (request: Omit<FriendRequest, "id">) => {
    const newRequest = {
      ...request,
      id: `fr${friendRequests.length + 1}`,
    };
    setFriendRequests([...friendRequests, newRequest]);
  };

  const updateFriendRequestStatus = (
    id: string,
    status: "accepted" | "rejected"
  ) => {
    const updatedRequests = friendRequests.map((request) =>
      request.id === id ? { ...request, status } : request
    );

    setFriendRequests(updatedRequests);

    if (status === "accepted") {
      const acceptedRequest = friendRequests.find((r) => r.id === id);
      if (acceptedRequest) {
        addFriend({
          name: acceptedRequest.name,
          phone: acceptedRequest.phone,
          avatar: acceptedRequest.avatar,
        });
      }
    }
  };

  const importContacts = (contacts: Array<{ name: string; phone: string }>) => {
    const existingPhones = new Set(friends.map((f) => f.phone));
    const newFriends = contacts
      .filter((contact) => !existingPhones.has(contact.phone))
      .map((contact, index) => ({
        id: `f${friends.length + index + 1}`,
        name: contact.name,
        phone: contact.phone,
      }));

    if (newFriends.length > 0) {
      setFriends([...friends, ...newFriends]);
    }
  };

  return (
    <UserContext.Provider
      value={{
        personas,
        groups,
        contents,
        activePersona,
        activeGroup,
        friends,
        friendRequests,
        addPersona,
        addGroup,
        addContent,
        setActivePersona,
        setActiveGroup,
        getPersonaById,
        getGroupById,
        addFriend,
        addFriendRequest,
        updateFriendRequestStatus,
        importContacts,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
