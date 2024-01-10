
# Microservices backend project

## Common package

1. Publish the common npm package

To do so, first pick a name for your common package, for example: `@username/common-project-name`.
Then login to npm -> `npm login`
And lastly publish it with -> `npm publish --access public` (ideally it's private but you'll pay for it)

2. Each time you issue updates to the common package do `npm patch` or similar accordingly to update the version of the package and `npm run clean && npm run build && npm publish`

## Add new services

Add more services and infrastructure with the generator.

