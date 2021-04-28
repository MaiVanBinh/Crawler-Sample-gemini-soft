const axios = require("axios");

const getPlayCount = async (episodeId) => {
  try {
    const res = await axios.get(
      `https://audioclip.naver.com/api/audioinfra/playcount?audioIds=${episodeId}`
    );
    if (res.data.audioIds.length > 0) {
        console.log(res.data.audioIds[0]["playCount"])
      return parseInt();
    }
    return 0;
  } catch (err) {
    console.log(err);
  }
};

console.log(getPlayCount('5E3C947ED5FE4A31B8F7CBBC8E617D84'))