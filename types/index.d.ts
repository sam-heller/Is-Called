

declare class ImageResponseData{
    get(key:string): string
    set(key:string, value:any): void
}

declare module htmldom{}
export {ImageResponseData, htmldom}

