import { SingleBar, MultiBar } from "cli-progress";

export class ProgressBar {
  bar: SingleBar | null = null;
  timer: NodeJS.Timeout | null = null;

  constructor(
    options?: ConstructorParameters<typeof SingleBar>[0],
    preset?: ConstructorParameters<typeof SingleBar>[1]
  ) {
    // @ts-ignore
    this.bar = new SingleBar({ ...options }, { ...preset });
  }

  updater = (progress: number) => {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.bar?.update(progress);
    // this.timer = setTimeout(() => {
    // }, 10);
  };
}
