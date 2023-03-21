# Garden-Observer
(re)Actions for on-chain events. Uses Tenderly Actions and Vitest for local development. 

## Setup
While installing dependencies for the root as well as the actions folder, copy over the `env.example` file to a `.env` file. 
```bash
# ./ (in root) install deps for local dev
npm i

# ./src/actions install deps to ship over to serverless land 🏝️
cd ./src/actions && npm i
```

## Testing
Testing is handled with Vitest and sets the environment to be development. This is so Discord isn't spammed during testing.
```bash
# Start vitest in visual mode. How exciting!
npm run test
```

The tests use a payload in the aptly named `payload` folder which contains a single transaction receipt. The tests basically mock having that event triggered and how to respond. The functions are designed to "throw" if the event shouldn't have been responded to. Maybe this was a bad decision. But they early exit which is fun.

I have this in BetterTouchTool set to a hotkey to get the tx receipt. Could use `cast receipt <tx> --rpc-url https://eth.llamarpc.com` as well.

```javascript
async (clipboardContentString) => {
  try {
    return JSON.stringify(
      (
        await (
          await fetch("https://eth.llamarpc.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: `{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["${clipboardContentString}"],"id":67}`,
          })
        ).json()
      ).result
    );
  } catch (error) {
    return "Error";
  }
};
```


## Deployment
Deployment happens either through GitHub Actions or locally.

### Locally
Call `tenderly actions deploy` which will upload the whole lot to Tenderly with some helpful output.
```bash
npm run deploy
```
### GitHub Actions
On every push, this action will deploy the actions to Tenderly. This is important to ensure that what exists on Tenderly is synched with what's in GitHub.

🚨 `TENDERLY_ACCESS_KEY` and `TENDERLY_EMAIL` must be set in a GitHub environment called "production"! If it's not called "production", make sure to update the github-actions-deploy.yaml! 🚨

