import AnimatedButton from "@/components/AnimatedButton";
import AuthModalContent from "@/components/AuthModalContent";
import BulletinPreview from "@/components/BulletinPreview";
import { Button } from "@/components/ui/button";
import { connectWithFriendRequest, getForeignUserImages } from "@/lib/api";
import { useAuth } from "@/providers/contexts/AuthContext";
import { useDialog } from "@/providers/dialog-provider";
import { useAppDispatch } from "@/redux";
import { fetchUser, User } from "@/redux/user";
import { staticGetUser } from "@/redux/user/selectors";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Register: React.FC = () => {
  const user = useSelector(staticGetUser);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const name = searchParams.get("name")?.split("_").join(" ");

  const [friendImages, setFriendImages] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      getForeignUserImages(id).then((images) => {
        console.log(images);
        setFriendImages(
          images[0].images.map(
            (image) =>
              `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images//${image}.jpeg`
          )
        );
      });
    }
  }, [id]);

  const { dialog, close } = useDialog();
  const { setAdditionalAction } = useAuth();

  console.log(friendImages);
  function renderScenario(userInfo: User) {
    switch (true) {
      case userInfo && userInfo.id !== null:
        return (
          <>
            <br />
            <br />
            <br />
            <br />
            <br />
            <h1 className="text-center text-4xl">Hi! {user.firstName}</h1>
            <br />
            <h1 className="text-center text-5xl">{name}</h1>
            <h3 className="text-center text-4xl">
              wants to add you to their bulletin!
            </h3>

            <br />
            <br />
            <br />
            <p>
              connecting with {name} will allow them to send you their bulletin,
              and allow you to add them to yours when you publish your own. if
              you've already started your bulletin, they'll get added to yours
              automatically!
            </p>
            <br />

            <BulletinPreview
              firstName={name.split(" ")[0]}
              images={friendImages}
            />

            <br />
            <br />
            <br />
            <AnimatedButton
              onClick={() => {
                connectWithFriendRequest({
                  user: user,
                  friendId: id,
                }).then(async (res) => {
                  console.log(res);
                  toast.success("Connected!");
                  await dispatch(fetchUser(user.phone_number)).then(() => {
                    navigate("/bulletin");
                  });
                });
              }}
            >
              Connect
            </AnimatedButton>
          </>
        );
      default:
      case userInfo === null:
        return (
          <>
            <br />
            <br />
            <br />
            <br />
            <br />
            <h1 className="text-center text-4xl">Hi there!</h1>
            <br />
            <h1 className="text-center text-5xl">{name}</h1>
            <h3 className="text-center text-4xl">
              wants to add you to their bulletin!
            </h3>

            <br />
            <br />
            <p>
              connecting with {name} will allow you to recieve their bulletin
              after you sign up. then you can create your own bulletin and allow
              them to receive yours!
            </p>
            <br />

            <BulletinPreview
              firstName={name.split(" ")[0]}
              images={friendImages}
            />

            <br />
            <br />
            <br />
            <AnimatedButton
              onClick={() => {
                dialog(<AuthModalContent close={close} signInState={false} />);
                setAdditionalAction(async () => {
                  await connectWithFriendRequest({
                    user: user,
                    friendId: id,
                  }).then(async (res) => {
                    console.log(res);
                    toast.success("Connected!");
                    await dispatch(fetchUser(user.phone_number));
                  });
                });
              }}
            >
              Sign Up, Connect
            </AnimatedButton>
          </>
        );
    }
  }

  return (
    <section>
      <div className="w-[45%] mr-auto ml-auto">{renderScenario(user)}</div>
    </section>
  );
};

export default Register;
