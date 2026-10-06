import { CustomThrottlerGuard } from "./throttler.guard";

describe("ThrottlerGuard", () => {
  it("should be defined", () => {
    expect(new CustomThrottlerGuard()).toBeDefined();
  });
});
