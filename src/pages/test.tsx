import { fetchBulletins } from "@/redux/user";
import { resetAllSlices, useAppDispatch, useAppSelector } from "@/redux/";
import React from "react";
import ReactInputVerificationCode from "react-input-verification-code";
import { toast } from "react-toastify";
import axios from "axios";
import { staticGetUser } from "@/redux/user/selectors";
import { useStytch, useStytchUser } from "@stytch/react";
import { quickValidation, supabase } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import phoneNumbers from "../../phone_numbers.json";
// import { myQApi } from "@hjdhjd/myq"

const Test: React.FC = () => {
  const stytch = useStytch();
  const navigate = useNavigate();
  const user = useAppSelector(staticGetUser);
  const userData = useStytchUser();
  const dispatch = useAppDispatch();
  // console.log(user);
  // console.log(userData);
  const tokens = stytch.session.getTokens();
  // console.log(tokens);

  const signOut = async () => {
    await stytch.session.revoke();
  };
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-screen">
        <button
          onClick={async () => {
            navigate("/bulletin?monthAlert=true");
          }}
        >
          Click me
        </button>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <button
          onClick={async () => {
            await fetch("http://localhost:8080/api/zine/generate", {
              method: "POST",
              body: JSON.stringify({
                "phone_numbers": phoneNumbers,
              }),
              headers: {
                Authorization: `Bearer ${tokens.session_jwt}`,
              },
            })

            // console.log(response);
          }}
        >
          start zine test
        </button>
        <br />
        <br />
        <br />
        <br />
        <br />
        <button
          onClick={async () => {
            // await fetch("http://myqexternal.myqdevice.com/Membership/ValidateUserWithCulture?appId=Vj8pQggXLhLy0WHahglCD4N1nAkkXQtGYpq2HrHD7H1nvmbT55KqtN6RSF4ILB%2fi&securityToken=null&username=jacobcarter5550@gmail.com&password=MSammyDOG!1&culture=en", {
            //   method: "GET",
            // });
            // const myq = await new myQApi().login("jacobcarter5550@gmail.com", "MSammyDOG!1")
            // console.log('myq', myq);
            const isLoggedIn = await fetch("http://localhost:3000/api/hello")
            console.log('islogg', isLoggedIn);
            // signOut();
          }}
        >
          {/* click try remote array_append */}
          myq test
        </button>

        <br />
        <br />
        <button
          onClick={async () => {
            try {
              const bucket = "bulletin-pdfs";
              const listAll = async (path = ""): Promise<string[]> => {
                const { data, error } = await supabase.storage.from(bucket).list(path);
                if (error) throw error;
                const files: string[] = [];
                for (const item of data ?? []) {
                  const fullPath = path ? `${path}/${item.name}` : item.name;
                  if (item.id != null) files.push(fullPath);
                  else files.push(...(await listAll(fullPath)));
                }
                return files;
              };
              const paths = await listAll();
              if (paths.length === 0) {
                toast.info("Bucket already empty");
                return;
              }
              const batch = 100;
              for (let i = 0; i < paths.length; i += batch) {
                const chunk = paths.slice(i, i + batch);
                const { error } = await supabase.storage.from(bucket).remove(chunk);
                if (error) throw error;
              }
              toast.success(`Emptied ${paths.length} file(s) from bulletin-pdfs`);
            } catch (e: unknown) {
              toast.error(e instanceof Error ? e.message : "Failed to empty bucket");
            }
          }}
        >
          Empty bulletin-pdfs bucket
        </button>

      </div>
    </Layout>
  );
};

export default Test;
