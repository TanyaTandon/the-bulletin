
import React from "react";
import Layout from "@/components/Layout";
import CreatePersonaForm from "@/components/CreatePersonaForm";

const CreatePersona = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">Create New Persona</h1>
        <CreatePersonaForm />
      </div>
    </Layout>
  );
};

export default CreatePersona;
