import { Module } from "@nestjs/common";
import { KongService } from "./kong.service.js";
import { HttpModule, HttpService } from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    providers: [KongService],
    exports: [KongService]
})
export class KongModule { }