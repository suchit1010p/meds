import OPDQueue from "../models/OPDQueue.js";

export const registerQueueSocket = (io) => {
  // 🔹 NEW NAMESPACE
  const queueNamespace = io.of("/live-queue");

  queueNamespace.on("connection", (socket) => {
    console.log("🟢 Live Queue socket connected:", socket.id);

    /* =========================================
       JOIN QUEUE ROOM (PATIENT / DOCTOR)
       ========================================= */
    socket.on("join-queue", async ({ queueId }) => {
      socket.join(queueId);

      const queue = await OPDQueue.findById(queueId);
      if (queue) {
        queueNamespace.to(queueId).emit("queue-update", queue);
      }
    });

    /* =========================================
       DOCTOR: MOVE TO NEXT TOKEN
       ========================================= */
    socket.on("next-token", async ({ queueId }) => {
      const queue = await OPDQueue.findById(queueId);
      if (!queue) return;

      const current = queue.queue.find(
        (q) => q.status === "serving"
      );
      if (current) current.status = "completed";

      const next = queue.queue.find(
        (q) => q.status === "waiting"
      );
      if (next) next.status = "serving";

      await queue.save();

      queueNamespace.to(queueId).emit("queue-update", queue);
    });

    /* =========================================
       DOCTOR: UPDATE TOKEN STATUS
       ========================================= */
    socket.on(
      "update-token",
      async ({ queueId, tokenNumber, status }) => {
        const queue = await OPDQueue.findById(queueId);
        if (!queue) return;

        const token = queue.queue.find(
          (q) => q.tokenNumber === tokenNumber
        );
        if (!token) return;

        token.status = status;
        await queue.save();

        queueNamespace.to(queueId).emit("queue-update", queue);
      }
    );

    /* =========================================
       ALERT PATIENT (TURN NEAR)
       ========================================= */
    socket.on("check-alerts", async ({ queueId }) => {
      const queue = await OPDQueue.findById(queueId);
      if (!queue) return;

      const servingIndex = queue.queue.findIndex(
        (q) => q.status === "serving"
      );

      queue.queue.forEach((q, index) => {
        if (
          q.status === "waiting" &&
          index - servingIndex <= 2
        ) {
          queueNamespace
            .to(queueId)
            .emit("alert", {
              tokenNumber: q.tokenNumber,
              message: "Your turn is coming soon ⏳",
            });
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Live Queue socket disconnected:", socket.id);
    });
  });
};

