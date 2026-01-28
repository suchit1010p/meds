import OPDQueue from "../models/OPDQueue.js";

/* =====================================================
   CREATE OR GET TODAY'S QUEUE
   ===================================================== */
export const getOrCreateQueue = async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let queue = await OPDQueue.findOne({
      hospitalId,
      doctorId,
      opdDate: today,
      status: "active",
    });

    if (!queue) {
      queue = await OPDQueue.create({
        hospitalId,
        doctorId,
        opdDate: today,
        queue: [],
      });
    }

    res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
   ADD PATIENT TO QUEUE
   ===================================================== */
export const addPatientToQueue = async (req, res) => {
  try {
    const { queueId, patientId, urgency } = req.body;

    const queue = await OPDQueue.findById(queueId);
    if (!queue)
      return res.status(404).json({ message: "Queue not found" });

    const nextToken = queue.currentToken + 1;

    queue.queue.push({
      tokenNumber: nextToken,
      patientId,
      urgency,
      estimatedWaitTime: queue.queue.length * 5, // 5 min avg
    });

    queue.currentToken = nextToken;
    await queue.save();

    res.status(201).json({
      success: true,
      message: "Patient added to queue",
      tokenNumber: nextToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
   UPDATE QUEUE STATUS (DOCTOR)
   ===================================================== */
export const updateQueueStatus = async (req, res) => {
  try {
    const { queueId, tokenNumber, status } = req.body;

    const queue = await OPDQueue.findById(queueId);
    if (!queue)
      return res.status(404).json({ message: "Queue not found" });

    const item = queue.queue.find(
      (q) => q.tokenNumber === tokenNumber
    );

    if (!item)
      return res.status(404).json({ message: "Token not found" });

    item.status = status;
    await queue.save();

    res.status(200).json({
      success: true,
      message: "Queue updated",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
   GET QUEUE (PATIENT VIEW)
   ===================================================== */
export const getQueueById = async (req, res) => {
  try {
    const { queueId } = req.params;

    const queue = await OPDQueue.findById(queueId)
      .populate("queue.patientId", "name");

    if (!queue)
      return res.status(404).json({ message: "Queue not found" });

    res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
