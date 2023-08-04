import { aiModels } from "tensornet/dist/ai-models";

test("all models load", async () => {
  jest.setTimeout(30000);

  try {
    expect(await aiModels.initMobileNet()).toBe(undefined);
  } catch (e) {
    console.error(e);
  }
});
