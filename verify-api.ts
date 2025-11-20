import { fetch } from "bun";

async function testLayerCreation() {
  try {
    console.log("--- START ---");
    
    // 1. Get Groups
    const groupsRes = await fetch("http://localhost:3000/api/admin/layer-groups");
    const groups = await groupsRes.json();
    console.log("Groups found: " + groups.length);

    let groupId = "default";
    if (groups.length > 0) {
      groupId = groups[0].id;
      console.log("Using group: " + groupId);
    } else {
      console.log("Creating group...");
      const createGroupRes = await fetch("http://localhost:3000/api/admin/layer-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "default", name: "Default Group" }),
      });
      if (!createGroupRes.ok) {
        console.log("Group create failed: " + createGroupRes.status);
        return;
      }
      console.log("Group created.");
    }

    // 2. Create Layer
    const id = "test-" + Math.floor(Math.random() * 10000);
    console.log("Creating layer: " + id);

    const response = await fetch("http://localhost:3000/api/admin/layers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: "Test Layer",
        kind: "vector",
        groupId,
        config: {
          type: "vector",
          schema: "public",
          table: "test",
          geomColumn: "geom",
        },
      }),
    });

    console.log("Status: " + response.status);
    if (response.status === 201) {
      console.log("SUCCESS");
    } else {
      const text = await response.text();
      console.log("ERROR BODY: " + text.substring(0, 100));
    }
    console.log("--- END ---");

  } catch (error) {
    console.log("EXCEPTION: " + error);
  }
}

testLayerCreation();
