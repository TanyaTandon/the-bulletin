import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  useAuth,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBulletin,
  createContent,
  deleteContent,
  getBulletin,
  updateContent,
} from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/redux";
import { setFriendsModal } from "@/redux/nonpersistent/controllers";
import { staticGetFriendsModal } from "@/redux/nonpersistent/controllers/selectors";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { staticGetUser } from "@/redux/user/selectors";
import { fetchUser } from "@/redux/user";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Bulletin = () => {
  const [bulletin, setBulletin] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(staticGetUser);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId.split("usr_")[1]));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const fetchBulletin = async () => {
      if (id) {
        setIsContentLoading(true);
        const bulletinData = await getBulletin(id);
        setBulletin(bulletinData);
        setContent(bulletinData.content);
        setIsContentLoading(false);
      }
    };

    fetchBulletin();
  }, [id]);

  const handleCreateBulletin = async () => {
    setIsLoading(true);
    try {
      const newBulletin = await createBulletin({
        creatorId: userId,
      });
      navigate(`/bulletin/${newBulletin.id}`);
      toast.success("Bulletin created!");
    } catch (error) {
      console.error("Error creating bulletin:", error);
      toast.error("Failed to create bulletin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!title || !body) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (id) {
        const newContent = await createContent({
          bulletinId: id,
          title: title,
          body: body,
          image: image,
          isPublic: isPublic,
        });

        setContent((prevContent) => [...prevContent, newContent]);
        setTitle("");
        setBody("");
        setImage("");
        setIsPublic(false);
        toast.success("Content created!");
      } else {
        toast.error("Please create a bulletin first");
      }
    } catch (error) {
      console.error("Error creating content:", error);
      toast.error("Failed to create content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    setIsLoading(true);
    try {
      await deleteContent(contentId);
      setContent((prevContent) =>
        prevContent.filter((item) => item.id !== contentId)
      );
      toast.success("Content deleted!");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContent = async () => {
    if (!title || !body) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsUpdating(true);
    try {
      if (selectedContentId) {
        const updatedContent = await updateContent(selectedContentId, {
          title: title,
          body: body,
          image: image,
          isPublic: isPublic,
        });

        setContent((prevContent) =>
          prevContent.map((item) =>
            item.id === selectedContentId ? updatedContent : item
          )
        );

        setTitle("");
        setBody("");
        setImage("");
        setIsPublic(false);
        setSelectedContentId(null);
        toast.success("Content updated!");
      } else {
        toast.error("No content selected for update");
      }
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditContent = (contentItem: any) => {
    setSelectedContentId(contentItem.id);
    setTitle(contentItem.title);
    setBody(contentItem.body);
    setImage(contentItem.image);
    setIsPublic(contentItem.isPublic);
  };

  const friendsModal = useAppSelector(staticGetFriendsModal);

  if (!isMounted) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">
            Welcome to Your Bulletin!
          </h1>
          {user ? (
            <div className="mb-4">
              <p>
                Hello, {user.name}!{" "}
                <Button
                  onClick={() => {
                    dispatch(setFriendsModal(!friendsModal));
                  }}
                >
                  Add Friends
                </Button>
              </p>
            </div>
          ) : (
            <p>Loading user info...</p>
          )}

          {!id ? (
            <Button
              onClick={handleCreateBulletin}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? "Creating..." : "Create New Bulletin"}
            </Button>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Create Content</h2>
                <Input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mb-2"
                />
                <Textarea
                  placeholder="Body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="mb-2"
                />

                <div className="flex items-center mb-2">
                  <Label htmlFor="public" className="mr-2">
                    Make Public?
                  </Label>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked)}
                  />
                </div>

                <Button
                  onClick={
                    selectedContentId ? handleUpdateContent : handleCreateContent
                  }
                  disabled={isLoading || isUpdating}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {isLoading
                    ? "Creating..."
                    : isUpdating
                    ? "Updating..."
                    : selectedContentId
                    ? "Update Content"
                    : "Create Content"}
                </Button>
              </div>

              <div>
                <h2 className="text-xl font-semibold">Your Content</h2>
                {isContentLoading ? (
                  <div className="flex items-center space-x-2">
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading content...</span>
                  </div>
                ) : (
                  <Accordion type="single" collapsible>
                    {content.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger>{item.title}</AccordionTrigger>
                        <AccordionContent>
                          <p>{item.body}</p>
                          {item.image && (
                            <img
                              src={item.image}
                              alt="Content Image"
                              className="mt-2 max-w-full h-auto"
                            />
                          )}
                          <Button
                            onClick={() => handleEditContent(item)}
                            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteContent(item.id)}
                            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          >
                            Delete
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Bulletin;
