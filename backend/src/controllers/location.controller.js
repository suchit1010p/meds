// Static data for now taaki dropdown khali na dikhe
const locationData = {
  "Jharkhand": ["Ranchi", "Dhanbad", "Bokaro", "Jamshedpur", "Hazaribagh"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur"]
};

/* GET ALL STATES */
export const getStates = async (req, res) => {
  try {
    const states = Object.keys(locationData); // Ye "Jharkhand", "Bihar" etc. uthayega
    res.status(200).json({ 
      success: true, 
      states 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET DISTRICTS BY STATE */
export const getDistrictsByState = async (req, res) => {
  try {
    const { state } = req.params;
    const districts = locationData[state] || []; // Selected state ke districts
    res.status(200).json({ 
      success: true, 
      districts 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};