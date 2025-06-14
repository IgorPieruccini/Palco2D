# Palco2D

Canvas2D framework to simplify manipulating 2D graphics in a comprehensive way, making development easier and more efficient, ideal for create tools with Canvas2D.

## Scripts

### Development Environment

To the packages, such as the Core & Plugins, you can run:

```bash
 npm run examples:start
```

This will fire up a development environment with a long set of examples with different scenarios, to test and debug your code.
You can also create your own examples to test and debug your code inside the `examples/src` folder.

### Build Core

To build the core project, you can run:

```bash
 npm run core:build
```

### Build Plugins

To build the plugins project, you can run:

```bash
 npm run plugins:build
```

### Build Documentation

First we need to parse the core project into MD documentation files using:

```bash
npm run website:doc:core
```

Then Update the documentation template to use the latest MD files by running:

```bash
npm run website:build
```

Then to preview the documentation, you can run:

```bash
npm run website:serve
```

To deploy the documentation, you can run:

```bash
npm run website:deploy
```
