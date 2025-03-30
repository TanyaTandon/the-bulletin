
import React from "react";
import Layout from "@/components/Layout";
import CreateGroupForm from "@/components/CreateGroupForm";

const CreateGroup = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">Create New Group</h1>
        <CreateGroupForm />
      </div>
    </Layout>
  );
};

export default CreateGroup;
