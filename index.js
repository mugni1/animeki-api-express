const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3030;

// JADWAL
app.get("/", async (req, res) => {
  res.json({
    message: "nyari apa abangku",
    enpoints: {
      endpoint1: {
        message: "GET JADWAL ANIME TERBARU",
        link: "https://animeki-api-express.vercel.app/jadwal",
      },
      endpoint2: {
        message: "GET ANIME DETAIL",
        link: "https://animeki-api-express.vercel.app/anime/:slug",
      },
      endpoint3: {
        message: "GET SEARCH ANIME RESULT",
        link: "https://animeki-api-express.vercel.app/search/?s=naruto",
      },
    },
  });
});
app.get("/jadwal", async (req, res) => {
  try {
    const url = "https://gojonime.com/jadwal-on-going-anime/"; // URL Detik.com bagian berita terpopuler
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // INISIALISASI RESULT
    let results = [];
    // AMBIL DAYA
    $(".bixbox.schedulepage").each((index, element) => {
      // days
      let day = $(element).find(".releases h3 span").text().trim();
      //   list animes
      let animes = [];
      $(element)
        .find(".listupd .bs .bsx a")
        .each((index, element) => {
          let link = $(element).attr("href").split("/").filter(Boolean).pop();
          let img = $(element).find(".limit img").attr("src");
          let alt = $(element).find(".limit img").attr("alt");
          let title = $(element).attr("title");
          animes.push({ img, alt, title, link });
        });
      results.push({ day, animes });
    });
    // RENDER KE USER
    res.status(200).json({ success: true, results: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// END SEARCH
app.get("/anime/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const baseUrl = `https://gojonime.com/anime/${slug}`;
    const { data } = await axios.get(baseUrl); // fetch url
    const $ = cheerio.load(data);
    // INIT PENAMPUNGAN DATA
    let anime = []; // penampungan utama
    let image = $(".thumb").find("img").attr("src");
    let title = $(".infox .entry-title").text().trim();
    let subTitle = $(".mindesc").text().trim();
    let status = $(".spe span").eq(0).text().trim();
    let studio = $(".spe span").eq(1).text().trim();
    let release_date = $(".spe span").eq(2).text().trim();
    let durasi = $(".spe span").eq(3).text().trim();
    let season = $(".spe span").eq(4).text().trim();
    let type = $(".spe span").eq(5).text().trim();
    let posted_by = $(".spe span").eq(6).text().trim();
    let created_date = $(".spe span").eq(7).text().trim();
    let updated_date = $(".spe span").eq(8).text().trim();

    let category = []; // category anime
    $(".genxed a").map((index, element) => {
      let categpry_name = $(element).text().trim();
      let category_link = $(element)
        .attr("href")
        .split("/")
        .filter(Boolean)
        .pop();
      category.push({ categpry_name, category_link });
    });

    let episodes = [];
    $(".eplister ul li a").map((index, element) => {
      let episode_link = $(element)
        .attr("href")
        .split("/")
        .filter(Boolean)
        .pop();
      let episode_no = $(element).find(".epl-num").text().trim();
      let episode_title = $(element).find(".epl-title").text().trim();
      let episode_date = $(element).find(".epl-date").text().trim();
      episodes.push({ episode_title, episode_link, episode_no, episode_date });
    });

    anime.push({
      title,
      image,
      subTitle,
      status,
      studio,
      release_date,
      durasi,
      season,
      type,
      posted_by,
      created_date,
      updated_date,
      category,
      episodes,
    });

    res.status(200).json({ success: false, data: anime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// SEARCH
app.get("/search/", async (req, res) => {
  const searchParams = req.query.s;
  const page = req.query.page;
  let baseUrl = `https://gojonime.com/?s=${searchParams}`;
  if (page) {
    baseUrl = `https://gojonime.com/page/${page}/?s=${searchParams}`;
  }
  if (searchParams) {
    try {
      const { data } = await axios({ method: "get", url: baseUrl });
      const $ = cheerio.load(data);

      let results = [];
      let animes = [];
      let pagination = [];

      /// RESULT ANIME
      $(".listupd .bs .bsx .tip").map((index, element) => {
        let title = $(element).find(".tt h2").text().trim();
        let image = $(element).find(".limit img").attr("src");
        let status = $(element).find(".limit .bt").text().trim();
        let link = $(element).attr("href").split("/").filter(Boolean).pop();
        let type = $(element).find(".limit .typez").text().trim();
        animes.push({ title, image, status, link, type });
      });
      /// END RESULT ANNIME

      /// PAGINATION
      let prev = $(".pagination .prev").attr("href")
        ? $(".pagination .prev").attr("href").split("/").filter(Boolean)[3]
        : null;
      let next = $(".pagination .next").attr("href")
        ? $(".pagination .next").attr("href").split("/").filter(Boolean)[3]
        : null;
      let currentPage = $(".pagination .current").text().trim();
      let pageNumbers = [];
      $(".pagination .page-numbers").map((index, element) => {
        const page = $(element).attr("href")
          ? $(element).attr("href").split("/").filter(Boolean)[3]
          : null;
        const search = $(element).attr("href")
          ? $(element).attr("href").split("/").filter(Boolean).pop()
          : null;
        const teks = $(element).text().trim();
        pageNumbers.push({ teks, page, search });
      });
      pagination.push({ prev, next, currentPage, pageNumbers });
      /// END PAGINATION

      // hasil
      results.push({ animes, pagination });
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
});
app.listen(PORT, () =>
  console.log(`Server berjalan di http://localhost:${PORT}`)
);
