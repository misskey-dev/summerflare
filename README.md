# Summerflare

[**Summ**aly](https://github.com/misskey-dev/summaly) ov**er** the Cloud**flare**

## Usage

```bash
pnpm i
pnpm wrangler deploy --minify
```

After executing the above command, access <https://workers.example/url?url=https%3A%2F%2Fexample.com> to verify that the worker is working properly.
Then configure your Misskey server to use the URL of the worker by setting the Summaly Proxy URL to <https://workers.example/url> in <https://misskey.example/admin/security>.
Alternatively, you can directly deploy the worker to your domain by setting the route in Cloudflare dashboard.

## License

Licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or
  <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT License ([LICENSE-MIT](LICENSE-MIT) or
  <http://opensource.org/licenses/MIT>)

at your option.

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
