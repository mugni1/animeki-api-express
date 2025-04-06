const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3030;

// JADWAL
app.get("/", async (req, res) => {
  res.json({
    message: "NYARI APA BANG?",
    endpoints: {
      jadwal_anime: {
        message: "GET JADWAL ANIME TERBARU",
        link: "https://animeki-api-express.vercel.app/schedule",
      },
      anime_detail: {
        message: "GET ANIME DETAIL",
        link: "https://animeki-api-express.vercel.app/anime/:slug",
      },
      anime_play: {
        message: "GET PLAY EPISODE",
        link: "https://animeki-api-express.vercel.app/play/:slug",
      },
      search_anime: {
        message: "GET SEARCH ANIME RESULT",
        link: "https://animeki-api-express.vercel.app/search/?s=naruto",
      },
      genres: {
        message: "GET GENRE LIST",
        link: "https://animeki-api-express.vercel.app/genres",
      },
      genres_anime_list: {
        message: "GET ANIME LIST WITH GENRE",
        link: "https://animeki-api-express.vercel.app/genres/:genre",
      },
      genres_anime_list_with_page: {
        message: "GET ANIME LIST WITH GENRE AND PAGE",
        link: "https://animeki-api-express.vercel.app/genres/:genre/page/:page",
      },
      movie_anime_list: {
        message: "GET MOVIE LIST ANIME",
        link: "https://animeki-api-express.vercel.app/movie",
      },
      movie_anime_list_with_page: {
        message: "GET MOVIE LIST ANIME WITH PAGE",
        link: "https://animeki-api-express.vercel.app/movie/page/:page",
      },
      ongoing_anime_list: {
        message: "GET ONGOING LIST ANIME",
        link: "https://animeki-api-express.vercel.app/ongoing",
      },
      ongoing_anime_list_with_page: {
        message: "GET ONGOING LIST ANIME WITH PAGE",
        link: "https://animeki-api-express.vercel.app/ongoing/page/:page",
      },
      completed_anime_list: {
        message: "GET COMPLETED LIST ANIME",
        link: "https://animeki-api-express.vercel.app/completed",
      },
      completed_anime_list_with_page: {
        message: "GET COMPLETED LIST ANIME WITH PAGE",
        link: "https://animeki-api-express.vercel.app/completed/page/:page",
      },
    },
    scraper: "A",
  });
});
// STREAM ANIME
app.get("/play/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const baseUrl = `https://gojonime.com/${slug}`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    const src_player_default = $(".player-embed iframe").attr("src");
    const episode_title = $(".entry-title").text().trim();
    const episode_year = $(".year").text().trim().replace(/\s+/g, " ");

    let servers = [];
    $(".mirror option").map((index, element) => {
      const server_src = $(element).attr("value");
      const server_title = $(element).text().trim();
      servers.push({ server_title, server_src });
    });
    servers.splice(0, 1);
    // hasil
    res.status(200).json({
      success: true,
      data: [{ episode_title, episode_year, src_player_default, servers }],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// DETAILS ANIME
app.get("/anime/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const baseUrl = `https://gojonime.com/anime/${slug}`;
    const { data } = await axios.get(baseUrl); // fetch url
    const $ = cheerio.load(data);
    // INIT PENAMPUNGAN DATA
    let anime = null; // penampungan utama
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
      let episode_slug = $(element)
        .attr("href")
        .split("/")
        .filter(Boolean)
        .pop();
      let episode_no = $(element).find(".epl-num").text().trim();
      let episode_title = $(element).find(".epl-title").text().trim();
      let episode_date = $(element).find(".epl-date").text().trim();
      episodes.push({ episode_title, episode_slug, episode_no, episode_date });
    });

    anime = {
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
    };

    res.status(200).json({ success: false, data: anime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// SCHEDULE ANIME
app.get("/schedule", async (req, res) => {
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
// SEARCH ANIME
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

      let results = null;
      let animes = [];
      let pagination = null;

      /// RESULT ANIME
      $(".listupd .bs .bsx .tip").map((index, element) => {
        let title = $(element).find(".tt h2").text().trim();
        let image = $(element).find(".limit img").attr("src");
        let status = $(element).find(".limit .bt").text().trim();
        let slug = $(element).attr("href").split("/").filter(Boolean).pop();
        let type = $(element).find(".limit .typez").text().trim();
        animes.push({ title, image, status, slug, type });
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
      pagination = { prev, next, currentPage, pageNumbers };
      /// END PAGINATION

      // hasil
      results = { animes, pagination };
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
});
// GENTRE LIST
app.get("/genres", async (req, res) => {
  try {
    const baseUrl = "https://gojonime.com/daftar-genre/";
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let results = [];
    $(".taxindex li").map((index, element) => {
      const slug = $(element)
        .find("a")
        .attr("href")
        .split("/")
        .filter(Boolean)
        .pop();
      const name = $(element).find("a .name").text().trim();
      const count = $(element).find("a .count").text().trim();
      results.push({ name, count, slug });
    });
    res.status(200).json({ success: true, results: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ANIME WITH GENRES
app.get("/genres/:genre", async (req, res) => {
  try {
    const slug = req.params.genre;
    const baseUrl = `https://gojonime.com/genres/${slug}`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = [];
    let animes = [];
    let pagination = [];
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;

    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const genre = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, genre, page });
    });
    pagination.push({ prevPage, nextPage, currentPage, pageNumbers });
    /// END PAGINATION

    /// HASIL AKHIR
    result.push({ animes, pagination });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ANIME WITH GENRES AND PAGE
app.get("/genres/:genre/page/:page", async (req, res) => {
  try {
    const slug = req.params.genre;
    const page = req.params.page;
    const baseUrl = `https://gojonime.com/genres/${slug}/page/${page}`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = [];
    let animes = [];
    let pagination = [];
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;

    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const genre = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, genre, page });
    });
    pagination.push({ prevPage, nextPage, currentPage, pageNumbers });
    /// END PAGINATION

    /// HASIL AKHIR
    result.push({ animes, pagination });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ONGOING ANIME - done
app.get("/ongoing", async (req, res) => {
  try {
    const baseUrl = `https://gojonime.com/on-going-anime/`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = null;
    let pagination = null;
    let animes = [];
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;
    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const params = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, params, page });
    });
    /// END PAGINATION

    // SET SET
    pagination = { prevPage, nextPage, currentPage, pageNumbers };
    result = { animes, pagination };
    // END SET SET

    /// HASIL AKHIR
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ONGOING ANIME WITH PAGE
app.get("/ongoing/page/:page", async (req, res) => {
  try {
    const page = req.params.page;
    const baseUrl = `https://gojonime.com/on-going-anime/page/${page}`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = null;
    let animes = [];
    let pagination = null;
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;

    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const params = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, params, page });
    });
    pagination = { prevPage, nextPage, currentPage, pageNumbers };
    /// END PAGINATION

    /// HASIL AKHIR
    result = { animes, pagination };
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// COMPLETED ANIME
app.get("/completed", async (req, res) => {
  try {
    const baseUrl = `https://gojonime.com/completed-anime/`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = null;
    let animes = [];
    let pagination = null;
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;

    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const params = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, params, page });
    });
    pagination = { prevPage, nextPage, currentPage, pageNumbers };
    /// END PAGINATION

    /// HASIL AKHIR
    result = { animes, pagination };
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .status(200)
      .json({ success: true, data: result });
  } catch (error) {
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .status(500)
      .json({ success: false, message: error.message });
  }
});
// COMPLETED ANIME WITH PAGE
app.get("/completed/page/:page", async (req, res) => {
  try {
    const page = req.params.page;
    const baseUrl = `https://gojonime.com/completed-anime/page/${page}`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = null;
    let animes = [];
    let pagination = null;
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;

    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const params = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, params, page });
    });
    pagination = { prevPage, nextPage, currentPage, pageNumbers };
    /// END PAGINATION

    /// HASIL AKHIR
    result = { animes, pagination };
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .status(200)
      .json({ success: true, data: result });
  } catch (error) {
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .status(500)
      .json({ success: false, message: error.message });
  }
});
// MOVIE ANIME
app.get("/movie", async (req, res) => {
  try {
    const slug = req.params.id;
    const baseUrl = `https://gojonime.com/movie/`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = [];
    let animes = [];
    let pagination = [];
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;

    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const params = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, params, page });
    });
    pagination.push({ prevPage, nextPage, currentPage, pageNumbers });
    /// END PAGINATION

    /// HASIL AKHIR
    result.push({ animes, pagination });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// MOVIE ANIME WITH PAGE
app.get("/movie/page/:page", async (req, res) => {
  try {
    const page = req.params.page;
    const baseUrl = `https://gojonime.com/movie/page/${page}`;
    const { data } = await axios({ method: "get", url: baseUrl });
    const $ = cheerio.load(data);

    let result = [];
    let animes = [];
    let pagination = [];
    // ANIMES
    $(".tip").map((index, element) => {
      const slug = $(element).attr("href").split("/").filter(Boolean).pop();
      const type = $(element).find(".limit .typez").text().trim();
      const status = $(element).find(".limit .bt .epx").text().trim();
      const image = $(element).find(".limit img").attr("src");
      const title = $(element).find(".tt h2").text().trim();
      animes.push({ title, image, slug, type, status });
    });
    // END ANIMES
    // PAGINATION
    let prevPage = $(".pagination .prev").attr("href")
      ? $(".pagination .prev").attr("href").split("/").filter(Boolean).pop()
      : null;
    let nextPage = $(".pagination .next").attr("href")
      ? $(".pagination .next").attr("href").split("/").filter(Boolean).pop()
      : null;

    let currentPage = $(".pagination .current").text().trim();
    let pageNumbers = [];
    $(".pagination .page-numbers").map((index, element) => {
      const params = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean)[3]
        : null;
      const page = $(element).attr("href")
        ? $(element).attr("href").split("/").filter(Boolean).pop()
        : null;
      const teks = $(element).text().trim();
      pageNumbers.push({ teks, params, page });
    });
    pagination.push({ prevPage, nextPage, currentPage, pageNumbers });
    /// END PAGINATION

    /// HASIL AKHIR
    result.push({ animes, pagination });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
app.listen(PORT, () =>
  console.log(`Server berjalan di http://localhost:${PORT}`)
);
