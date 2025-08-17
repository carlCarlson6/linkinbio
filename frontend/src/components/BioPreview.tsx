import { Button, Flex, Heading, Text } from '@radix-ui/themes';

export interface BioView {
  title: string;
  description?: string;
  links?: { url: string; label?: string }[];
}

export function BioView({ title, description, links }: BioView) {
  return (
    <>
      <Heading size="6">{title}</Heading>
      {description && <Text color="gray" style={{ marginBottom: 24 }}>{description}</Text>}
      {links && links.length > 0 && (
        <Flex direction="column" gap="2" style={{ width: '100%', maxWidth: 340 }}>
          {links.map((link, idx) => (
            <Button asChild variant="surface" style={{ justifyContent: 'flex-start' }} key={idx}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label || link.url}
              </a>
            </Button>
          ))}
        </Flex>
      )}
    </>
  );
}

export default BioView;
