"use client";

import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../components/builder";
import { useEffect, useState } from "react";
import { getHubspotUtk } from "@/utils/getHubspotUtk";
import React from "react";

// Builder Public API Key set in .env file
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);

builder.setUserAttributes({
  company: "unknown",
  pipelineStage: "unknown",
  jobtitle: "unknown",
});

// Helper function to get a cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Helper function to set a cookie
const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export default function Page({ params }) {
  const unwrappedParams = React.use(params);
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchUserAndSetAttributes = async () => {
      // Check if user attributes already exist in cookies
      const company = getCookie("company");
      const pipelineStage = getCookie("pipelineStage");
      const jobtitle = getCookie("jobtitle");

      if (company && pipelineStage && jobtitle) {
        // If cookies exist, set the user attributes from cookies
        builder.setUserAttributes({
          company,
          pipelineStage,
          jobtitle,
        });
      }

      const hutk = getHubspotUtk();

      if (hutk) {
        try {
          const response = await fetch("/api/hubspot-user", {
            method: "POST",
            body: JSON.stringify({ hutk }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          const userAttributes = {
            company: data?.properties?.company || "unknown",
            pipelineStage: data?.properties?.hs_pipeline || "unknown",
            jobtitle: data?.properties?.jobtitle || "unknown",
          };

          // Set user attributes and store them in cookies
          builder.setUserAttributes(userAttributes);
          setCookie("company", userAttributes.company);
          setCookie("pipelineStage", userAttributes.pipelineStage);
          setCookie("jobtitle", userAttributes.jobtitle);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserAndSetAttributes();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const builderModelName = "page";
      const urlPath = "/" + (unwrappedParams?.page?.join("/") || "");

      const content = await builder
        .get(builderModelName, {
          userAttributes: { urlPath },
        })
        .toPromise();

      setContent(content);
    };

    fetchContent();
  }, [unwrappedParams?.page]);

  return (
    <>
      <RenderBuilderContent content={content} model="page" />
    </>
  );
}
