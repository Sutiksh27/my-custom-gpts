"use client";

import { assistantAtom, assistantsAtom, fileAtom, messagesAtom } from "@/atom";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAtom } from "jotai";
import { Assistant } from "openai/resources/beta/assistants/assistants.mjs";
import React, { useState } from "react";
import toast from "react-hot-toast";

function Assistant() {
  // Atom State
  const [assistant, setAssistant] = useAtom(assistantAtom);
  const [assistants, setAssistants] = useAtom(assistantsAtom);
  const [, setMessages] = useAtom(messagesAtom);
  const [file] = useAtom(fileAtom);

  // State
  const [creating, setCreating] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [listing, setListing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [choosing, setChoosing] = useState(false);

  // Radio Button
  const [selectedValue, setSelectedValue] = useState<string>("")
  const options = assistants.map((a)=>({value: a.id, label: a.name}));
  

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await axios.get<{ assistant: Assistant }>(
        "/api/assistant/create"
      );

      const newAssistant = response.data.assistant;
      console.log("newAssistant", newAssistant);
      setAssistant(newAssistant);
      localStorage.setItem("assistant", JSON.stringify(newAssistant));
      toast.success("Successfully created assistant", {
        position: "bottom-center",
      });
    } catch (error) {
      console.log("error", error);
      toast.error("Error creating assistant", { position: "bottom-center" });
    } finally {
      setCreating(false);
    }
  };

  const handleChoose = async () => {
    const assistantId = selectedValue;
    setChoosing(true);
    try {
      const response = await axios.get<{assistant: Assistant}>(
        `/api/assistant/choose?assistantId=${assistantId}`
      );

      const assistant = response.data.assistant;
      console.log("Assistant: ", assistant);
      setAssistant(assistant);
      setChoosing(false);
    } catch (error) {
      console.log("error", error);
      toast.error("Error creating assistant", { position: "bottom-center" });
    } finally {
      setCreating(false);
    }
  }

  const handleModify = async () => {
    setModifying(true);
    try {
      const response = await axios.get<{ assistant: Assistant }>(
        `/api/assistant/modify?assistantId=${assistant?.id}&fileId=${file}`
      );

      const newAssistant = response.data.assistant;
      setAssistant(newAssistant);
      localStorage.setItem("assistant", JSON.stringify(newAssistant));
      toast.success("Successfully created assistant", {
        position: "bottom-center",
      });
    } catch (error) {
      console.log("error", error);
      toast.error("Error creating assistant", { position: "bottom-center" });
    } finally {
      setModifying(false);
    }
  };

  const handleList = async () => {
    setListing(true);
    try {
      const response = await axios.get<{ assistants: Assistant[] }>(
        `/api/assistant/list`
      );

      const assistantList = response.data.assistants;
      console.log("assistants", assistantList);
      setAssistants(assistantList);
      toast.success(
        `Assistants:\n${assistants.map((a) => `${a.name + "\n"}`)} `,
        {
          position: "bottom-center",
        }
      );
    } catch (error) {
      console.log("error", error);
      toast.error("Error listing assistants", { position: "bottom-center" });
    } finally {
      setListing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.get(`/api/assistant/delete?assistantId=${assistant?.id}`);

      setAssistant(null);
      localStorage.removeItem("assistant");
      toast.success("Successfully deleted assistant", {
        position: "bottom-center",
      });
      setMessages([]);
    } catch (error) {
      console.log("error", error);
      toast.error("Error deleting assistant", { position: "bottom-center" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col mb-8">
      <h1 className="text-4xl font-semibold mb-4">Assistant</h1>
      <div className="flex flex-row gap-x-4 w-full">
        <Button onClick={handleCreate}>
          {creating ? "Creating..." : "Create"}
        </Button>
        <Button onClick={handleChoose}>
          {choosing? "Choosing..." : "Choose"}
        </Button>
        <Button onClick={handleModify} disabled={!assistant || !file}>
          {modifying ? "Modifying..." : "Modify"}
        </Button>
        <Button onClick={handleList}>{listing ? "Listing..." : "List"}</Button>
        <Button onClick={handleDelete} disabled={!assistant}>
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
      {choosing? (<div>
        {options.map((option) => (
          <li key={option.value}>
          <label>
            <input
              type="radio"
              name="radiogroup" // ensure consistent group name
              value={option.value}
              checked={selectedValue === option.value} // bind to state
              onChange={(event) => setSelectedValue(event.target.value)} // update state on change
            />
            {option.label}
          </label>
        </li>
        ))}
      </div>) : (<div></div>)}
    </div>
  );
}

export default Assistant;
