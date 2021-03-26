import Bottleneck from 'bottleneck'


export declare class BaseRequest {
    limiter:Bottleneck
}
export declare class WikipediaAPI extends BaseRequest {}
export declare class DiversityWebAPI extends BaseRequest {}


export declare class Image {
    id:string
    link:string
    source:string
    owner:string
    license:string
    downloaded:string
    verified:string
}






