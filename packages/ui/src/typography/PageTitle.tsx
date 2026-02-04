import { Title, type TitleProps } from "@mantine/core";

type PageTitleProps = Omit<TitleProps, "order">;

export function PageTitle({ children, ...props }: PageTitleProps) {
  return (
    <Title order={1} {...props}>
      {children}
    </Title>
  );
}
