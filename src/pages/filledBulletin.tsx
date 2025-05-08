import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import {
  Bulletin,
  getBulletin,
  submitFeedback,
  updateBulletin,
} from "@/lib/api";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import { UploadedImage } from "@/components/ImageUploadGrid";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FriendModalContent from "@/components/FriendModalContent";
import TypewriterText from "@/components/TypewriterText";
import axios from "axios";

const FilledBulletin: React.FC = () => {
  const user = useAppSelector(staticGetUser);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [feedback, setFeedback] = useState<string>("");

  // Using useParams hook from react-router-dom to get URL parameters
  const { id } = useParams<{ id: string }>();
  const [bulletinData, setBulletin] = useState<Bulletin | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Custom placeholder for the blurb textarea
  const customPlaceholder =
    "April filled my heart with so much joy. I ordained my best friend's wedding, and everybody laughed and cried (as God and my speech intended). I loved building the bulletin with my best friends all day, every day, when I wasn't working at my big-girl job. !!";

  console.log("URL Slug:", bulletinData, user);

  const handleNewSubmission = () => {
    navigate("/bulletin");
  };

  const bulletin = user?.bulletins?.find((bulletin) => bulletin === id);

  useEffect(() => {
    if (bulletin && bulletinData === null) {
      console.log(bulletin);
      getBulletin(bulletin).then((data) => {
        console.log(data[0].saved_notes);
        console.log(
          Object.keys(data[0].saved_notes).map((item, index) => ({
            date: item,
            note: data[0].saved_notes[item],
          }))
        );
        const setData = {
          ...data[0],
          savedNotes: Object.keys(data[0].saved_notes).map((item) => ({
            date: new Date(item),
            note: data[0].saved_notes[item],
          })),
          images: data[0].images.map((item) => ({
            id: item,
            url: `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images//${item}.png`,
          })),
        };
        setBulletin(setData);
      });
    }
  }, [bulletin, bulletinData]);

  // Create type-safe setter functions to work with ImageUploadGrid and BlurbInput components
  const setImages = (
    newImages: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])
  ) => {
    if (bulletinData) {
      if (typeof newImages === "function") {
        const updatedImages = newImages(bulletinData.images);
        setBulletin({
          ...bulletinData,
          images: updatedImages,
        });
      } else {
        setBulletin({
          ...bulletinData,
          images: newImages,
        });
      }
    }
  };

  const setSavedNotes = (
    newNotes: CalendarNote[] | ((prev: CalendarNote[]) => CalendarNote[])
  ) => {
    if (bulletinData) {
      if (typeof newNotes === "function") {
        const updatedNotes = newNotes(bulletinData.savedNotes);
        setBulletin({
          ...bulletinData,
          savedNotes: updatedNotes,
        });
      } else {
        setBulletin({
          ...bulletinData,
          savedNotes: newNotes,
        });
      }
    }
  };

  const setBlurb = (newBlurb: string | ((prev: string) => string)) => {
    if (bulletinData) {
      if (typeof newBlurb === "function") {
        const updatedBlurb = newBlurb(bulletinData.blurb);
        setBulletin({
          ...bulletinData,
          blurb: updatedBlurb,
        });
      } else {
        setBulletin({
          ...bulletinData,
          blurb: newBlurb,
        });
      }
    }
  };

  const handleUpdateBulletin = async () => {
    if (!user || !bulletinData) return;

    setIsUpdating(true);

    try {
      // Create a FormData object to properly handle file uploads
      const formData = new FormData();

      let dup = structuredClone(bulletinData);
      dup.saved_notes = dup.savedNotes;
      delete dup.savedNotes;
      // Add the non-file data
      formData.append("user", JSON.stringify(user));
      formData.append("bulletinData", JSON.stringify(dup));

      // Process and append each image if bulletinData.images exists
      if (bulletinData.images && bulletinData.images.length > 0) {
        const processedImages = [];

        for (let i = 0; i < bulletinData.images.length; i++) {
          const image = bulletinData.images[i];

          // Check if the image URL is a local blob URL (not an S3 URL)
          if (image.url && image.url.startsWith("blob:")) {
            // Fetch the blob data from the local URL
            const fetchBlob = await fetch(image.url, {
              method: "GET",
              headers: {
                Accept: "image/png",
              },
            });

            const blob = await fetchBlob.blob();

            // Create a filename for the image
            const filename = `image_${i}_${Date.now()}.png`;

            // Append the actual file to FormData
            formData.append(`images`, blob, filename);

            // Keep track of image metadata
            processedImages.push({
              id: image.id,
              filename: filename,
            });
          } else {
            // This is an S3 URL, so just add the metadata
            processedImages.push({
              id: image.id,
              url: image.url,
              isExisting: true,
            });
          }
        }

        // Add image metadata as a JSON string
        formData.append("imageMetadata", JSON.stringify(processedImages));
      }

      // Use FormData with axios
      console.log(formData);
      const result = await axios.post(
        "https://lvwebhookrepo-production.up.railway.app/bulletinEditing",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (result.data.success) {
        toast.success("Bulletin updated successfully!");
        setTimeout(() => {
          navigate("/bulletin/filled");
        }, 1500);
      } else {
        toast.error("Failed to update bulletin");
      }
    } catch (error) {
      console.error("Error updating bulletin:", error);
      toast.error("An error occurred while updating your bulletin");
    } finally {
      setIsUpdating(false);
    }
  };
  console.log("Bulletin data:", user);

  const renderContent = () => {
    switch (id) {
      case "filled":
        return (
          <>
            <div className="flex flex-col items-center justify-center pt-8 pb-12 space-y-8 px-6 max-w-3xl mx-auto w-full">
              <div className="space-y-6 w-full text-center">
                <h1 className="text-4xl font-bold text-foreground">
                  hooray! your bulletin has been submitted.
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  thank you for being part of our pilot. we're excited to show
                  you what your friends have been up to! &lt;3
                </p>
                <div className="flex flex-col items-center space-y-2"></div>
              </div>
              <FriendModalContent full />
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    we'd love to hear anything and everything: comments,
                    critiques, suggestions, requests?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="we'd love to hear anything and everything: comments, critiques, suggestions, requests?"
                    className="min-h-[120px]"
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={async () => {
                      await submitFeedback({
                        feedback: feedback,
                        user: user.phone_number,
                      }).then((res) => {
                        if (res.success) {
                          toast.success("Feedback submitted. Thank you!");
                        } else {
                          toast.error("Failed to submit feedback");
                        }
                      });
                    }}
                    className="w-full"
                  >
                    Submit Feedback
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <Button
              className="bg-gradient-to-r from-accent to-primary hover:opacity-90 font-medium flex mr-auto ml-auto"
              onClick={() => navigate(`/bulletin/${user.bulletins?.[0]}`)}
            >
              Edit your bulletin →
            </Button>
          </>
        );
      default:
        if (bulletinData) {
          return (
            <>
              <div className="text-left min-h-[6em] mb-6">
                <TypewriterText
                  text={`<p>welcome to the bulletin!</p><p>we're happy you're here. ❤️</p><p>upload your pictures, text, and calendar dates below.</p><p>we will gather this content from all your friends, design it beautifully into your bulletin, and ship it to you on may 5th.</p>`}
                  speed={isMobile ? 30 : 35}
                  className="text-xl"
                />
              </div>
              <BlurbInput
                savedNotes={bulletinData.savedNotes}
                setSavedNotes={setSavedNotes}
                blurb={bulletinData.blurb}
                setBlurb={setBlurb}
                images={bulletinData.images}
                setImages={setImages}
                placeholder={customPlaceholder}
              />
              <Button
                onClick={handleUpdateBulletin}
                size="lg"
                style={{
                  marginRight: "auto",
                  marginLeft: "auto",
                  display: "flex",
                }}
                className="bg-gradient-to-r from-accent to-primary hover:opacity-90 font-medium"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  "Updating..."
                ) : (
                  <>
                    <Sparkles className="mr-2" />
                    Update your Bulletin
                  </>
                )}
              </Button>
            </>
          );
        } else {
          return (
            <>
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <h1 className="text-2xl font-medium text-center">
                You don't have a bulletin yet!
              </h1>
              <Button
                className="bg-gradient-to-r from-accent to-primary hover:opacity-90 font-medium flex mr-auto ml-auto"
                onClick={() => navigate("/bulletin")}
              >
                <Sparkles className="mr-2" />
                Go create a bulletin! →
              </Button>
            </>
          );
        }
    }
  };

  return (
    <Layout>
      <div className={`mx-auto ${isMobile ? "px-4 pt-0" : "container py-6"}`}>
        <div className="max-w-3xl mx-auto space-y-6">{renderContent()}</div>
      </div>
    </Layout>
  );
};

export default FilledBulletin;
