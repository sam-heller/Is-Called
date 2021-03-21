# Is Called

Playing around with Cloudflare pages and workers to expose animal facts.

Check it out at [http://what.iscalled.com](http://what.iscalled.com) or go directly to a specific definition page such as [http://snake.infant.iscalled.com/](http://snake.infant.iscalled.com/) or [http://swan.group.iscalled.com/](http://swan.group.iscalled.com/)

Data is originally pulled from the [List of Animal Names](https://en.wikipedia.org/wiki/List_of_animal_names) Wikipedia entry, but has been tweaked to add a few entries here and there.

Additional names are welcome, just submit a PR for the [Animals CSV](https://github.com/sam-heller/Is-Called/blob/main/build/wikipedia.csv).

## Setup Data

Copy the .env.example file into .env, and replace the following values
```bash
ACCOUNT_ID=<CLOUDFLARE ACCOUNT ID>
NAMESPACE_ID=<CLOUDFLARE KV NAMESPACE ID>
API_EMAIL=<CLOUDFLARE API EMAIL ADDRESS>
API_TOKEN=<CLOUDFLARE API TOKEN>
```

In order to update the Cloudflare KV store with the animal data, run the build script
```
 % npm run build

> @1.0.0 build /Users/name/Dev/Is-Called
> npm run buildData && npm run saveData


> @1.0.0 buildData /Users/name/Dev/Is-Called
> node build/setup.js build_data


> @1.0.0 saveData /Users/name/Dev/Is-Called
> node build/setup.js save_data

response setting bulk values :  { result: null, success: true, errors: [], messages: [] }

```

## Routing
Information is pulled based on the specific subdomain 