import { JwtGuard } from "./auth.guard";

describe("AuthGuard", () => {
  it("should be defined", () => {
    expect(new JwtGuard()).toBeDefined();
  });
});
