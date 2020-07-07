import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import mongoose from "mongoose";
import IBconModel, { IIBcon } from "./models/Ibcon";

const version = "1.0.0";
const app = new Koa();
const router = new Router();
const reImgurl = /^https:\/\/(?:(?:(?:ncache|www)\.ilbe\.com\/files\/attach\/(?:cmt|new)\/\d*\/\d*\/.*\/\d*\/.*_(\d*)\.(?:jpe?g|png|gif))|(?:(?:www\.)?ilbe\.com\/file\/download\/(\d*)))$/g;

interface ResponseMessage<T> {
  error?: Error;
  data: T;
}
interface RequestMessage<T> {
  data: T;
}

interface IIBconInput {
  readonly title: IIBcon["title"];
  readonly tags: IIBcon["tags"];
  readonly source: IIBcon["source"];
  readonly images: IIBcon["images"];
}
interface SearchInput {
  query?: string;
  ids?: string[];
}

app
  .use(bodyParser())
  .use(
    cors({
      origin: (ctx) => {
        if (ctx.header.origin.match(/https:\/\/(www\.)?ilbe\.com/i))
          return ctx.header.origin;
        else return "null";
      },
    })
  )
  .use(router.routes());

router.get("/info", async (ctx) => {
  ctx.body = { version };
});

router.post("/add", async (ctx) => {
  const { data }: RequestMessage<IIBconInput> = ctx.request.body;

  try {
    for (const image of data.images)
      if (!image.match(reImgurl)) throw Error("올바르지 않은 이미지입니다.");
    const ilbecon = await IBconModel.create({
      title: data.title,
      source: data.source,
      tags: data.tags,
      images: data.images,
    });
    const resBody: ResponseMessage<IIBcon> = {
      data: ilbecon,
    };
    ctx.body = resBody;
  } catch (err) {
    let resBody: ResponseMessage<null>;
    switch (err.code) {
      case 11000:
        resBody = {
          error: { name: err.name, message: "일베콘 이름이 이미 존재합니다." },
          data: null,
        };
        break;
      default:
        resBody = {
          error: { name: err.name, message: err.message },
          data: null,
        };
    }
    ctx.body = resBody;
  }
});

router.post("/search", async (ctx) => {
  const { data: input }: RequestMessage<SearchInput> = ctx.request.body;

  try {
    let IBcons: IIBcon[];
    if (input.query)
      IBcons = await IBconModel.find({
        $or: [{ title: input.query }, { tags: input.query }],
      }).exec();
    else if (input.ids)
      IBcons = await IBconModel.find({
        _id: input.ids,
      }).exec();
    else IBcons = [];

    const resBody: ResponseMessage<IIBcon[]> = {
      data: IBcons,
    };
    ctx.body = resBody;
  } catch (err) {
    const resBody: ResponseMessage<null> = {
      error: { name: err.name, message: err.message },
      data: null,
    };
    ctx.body = resBody;
  }
});

mongoose
  .connect(`mongodb://${process.env.MONGODB_HOST}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(3000);
    console.log("listening on port 3000");
  });
