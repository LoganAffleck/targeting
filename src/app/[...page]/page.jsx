"use client";

import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../components/builder";
import { useEffect, useState } from "react";
import { getHubspotUtk } from "@/utils/getHubspotUtk";

// Builder Public API Key set in .env file
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);

export default function Page({ params }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchUserAndSetAttributes = async () => {
      const hutk = getHubspotUtk();
      if (hutk) {
        try {
          // Fetch user data from your API route
          const response = await fetch("/api/hubspot-user", {
            method: "POST",
            body: JSON.stringify({ hutk }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const userData = await response.json();
            console.log(userData)
            // Set user attributes in Builder
            builder.setUserAttributes({
              audience: userData.audience || "normal", // Example attribute
              email: userData.email, // Example attribute
              name: userData.name, // Example attribute
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserAndSetAttributes();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const builderModelName = "page";

      const content = await builder
        .get(builderModelName, {
          userAttributes: {
            urlPath: "/" + (params?.page?.join("/") || ""),
          },
        })
        .toPromise();

      setContent(content);
    };

    fetchContent();
  }, [params?.page]);

  return (
    <>
      {/* Render the Builder page */}
      <RenderBuilderContent content={content} model="page" />
    </>
  );
}
