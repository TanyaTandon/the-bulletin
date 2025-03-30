
import React, { createContext, useContext, useState, ReactNode } from "react";

export type ContentType = "picture" | "note" | "writing";

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

interface UserContextType {
  personas: Persona[];
  groups: Group[];
  contents: Content[];
  activePersona: Persona | null;
  activeGroup: Group | null;
  addPersona: (persona: Omit<Persona, "id">) => void;
  addGroup: (group: Omit<Group, "id">) => void;
  addContent: (content: Omit<Content, "id" | "createdAt">) => void;
  setActivePersona: (personaId: string | null) => void;
  setActiveGroup: (groupId: string | null) => void;
  getPersonaById: (id: string) => Persona | undefined;
  getGroupById: (id: string) => Group | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Initial demo data
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

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [activePersona, setActivePersonaState] = useState<Persona | null>(initialPersonas[0]);
  const [activeGroup, setActiveGroupState] = useState<Group | null>(null);

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

  return (
    <UserContext.Provider
      value={{
        personas,
        groups,
        contents,
        activePersona,
        activeGroup,
        addPersona,
        addGroup,
        addContent,
        setActivePersona,
        setActiveGroup,
        getPersonaById,
        getGroupById,
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
