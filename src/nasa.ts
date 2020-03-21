import { ChannelItem, DirectoryItem, DirectoryFeatures } from "@watchedcom/sdk";
import fetch from "node-fetch";
import { parse as parseUrl, format as formatUrl } from "url";

/*
let locales = require('./locales.json');
locales = locales.map(item => ({ key: item.code, value: item.name }));
*/

let videos: any = [];

const apiUrl = "https://www.nasa.gov";

const logger = (...args) => {
  if (process.env.DEBUG) {
    console.log(`API `, ...args);
  }
};

class NasaApi {
  async getVideos({ filter = {}, page }) {
    const limit = 24;
    const offset = page > 0 ? (page - 1) * limit : 0;
    return await this.get(
      "api/1/query/ytPlist/PLiuUQ9asub3RHqKdK_XZSZ8I_981UPhvX.json",
      {
        feedLimit: 100,
        index: offset >= 96 ? 96 : offset,
        pagesize: limit
        //page,
      }
    ).then(({ data }) => {
      const items = Array.from(data.items || []).map<ChannelItem>((item: any) =>
        this.convertChannel(item)
      );
      videos = items;
      return {
        hasMore: offset <= 96,
        items
      };
    });
  }

  async getVideo({ ids }) {
    const id = ids.id;
    return videos.find(it => it.id === id);
  }

  convertChannel(data: any): ChannelItem {
    const { id, snippet } = data;
    const channel: ChannelItem = {
      id: id,
      type: "channel",
      ids: { id },
      name: snippet.title,
      description: snippet.description,
      releaseDate: snippet.publishedAt,
      images: {
        logo: snippet.thumbnails.standard.url || undefined,
        poster: snippet.thumbnails.standard.url || undefined
      },
      sources: []
    };
    if (snippet.resourceId && snippet.resourceId.kind === "youtube#video") {
      // https://www.youtube.com/embed/jNQXAC9IVRw
      channel.sources?.push({
        id: snippet.resourceId.videoId,
        name: snippet.title,
        type: "url",
        url: `https://www.youtube.com/embed/${snippet.resourceId.videoId}`
      });
    }
    return channel;
  }

  async get(pathname = "", query = {}, options = {}) {
    return this.api({ pathname, query }, options);
  }

  async post(pathname, data = {}, query = {}, options = {}) {
    return this.api(
      { pathname, query },
      {
        ...options,
        method: "post",
        body: data
      }
    );
  }

  async put(pathname, data = {}, query = {}, options = {}) {
    return this.api(
      { pathname, query },
      {
        ...options,
        method: "put",
        body: data
      }
    );
  }

  async delete(pathname, query = {}, options = {}) {
    return this.api(
      { pathname, query },
      {
        ...options,
        method: "delete"
      }
    );
  }

  async api(url, options: any = {}) {
    let { body, headers = {} } = options;
    //const apiKey = process.env.NASA_API_KEY;
    headers = {
      //'Content-Type': 'application/json',
      ...headers
    };
    if (body && typeof body === "object") {
      if (headers["Content-Type"] === "application/json") {
        body = this.handleBodyAsJson(body);
      } else if (
        headers["Content-Type"] === "application/x-www-form-urlencoded"
      ) {
        body = this.handleBodyAsFormUrlencoded(body);
      }
    }
    let opts = { ...options, body, headers };
    const apiUrl = this.apiUrl(url);
    logger("request", apiUrl, opts);
    const res = await fetch(apiUrl, opts);
    return this.handleResponse(res);
  }

  apiUrl(url: any = {}) {
    let { pathname, query = {}, ...other } = url;
    let parsedApiUrl = parseUrl(apiUrl);
    if (String(pathname).startsWith("http")) {
      parsedApiUrl = parseUrl(pathname);
      pathname = parsedApiUrl.pathname;
    }
    return formatUrl({
      ...parsedApiUrl,
      pathname,
      query,
      ...other
    });
  }

  async handleResponse(res) {
    const contentType = res.headers.get("content-type") || "text";
    if (contentType.includes("json")) {
      return this.handleResponseAsJson(res);
    }
    return this.handleResponseAsText(res);
  }

  handleBodyAsJson(data = {}) {
    return JSON.stringify(data);
  }

  handleBodyAsFormUrlencoded(body) {
    return Object.entries(body)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) =>
        Array.isArray(value)
          ? value.map(item => `${key}=${item}`).join("&")
          : `${key}=${value}`
      )
      .join("&");
  }

  async handleResponseAsJson(res) {
    if (res.status >= 400) {
      const error = await res.json();
      //logger('error', error);
      throw error;
    }
    if (res.status === 204) {
      return null;
    }
    let data = await res.json();
    data = typeof data === "string" ? JSON.parse(data) : data;
    //logger('response', res.url, res.status, res.headers.get('content-type'), data);
    return data;
  }

  async handleResponseAsText(res) {
    if (res.status >= 400) {
      const error = await res.text();
      //logger('error', error);
      throw error;
    }
    if (res.status === 204) {
      return null;
    }
    const data = await res.text();
    //logger('response', res.url, res.status, res.headers.get('content-type'), data);
    return data;
  }
}

const client = new NasaApi();

/*
async function boot() {
  const res = await client.getVideos({ page: 1 });
  console.log(res);
}
boot();
*/

export default client;

/*
import NasaClient from 'twitch';

const clientId = process.env.TWITCH_CLIENT_ID as string;
const clientSecret = process.env.TWITCH_SECRET_KEY as string;
const twitchClient = NasaClient.withClientCredentials(clientId, clientSecret);

export default twitchClient;
*/
