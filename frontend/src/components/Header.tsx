import { useUser, UserButton } from '@clerk/clerk-react';
import { Flex, Heading } from '@radix-ui/themes';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=EEE&color=888&size=48&rounded=true';

export function Header() {
  const { isSignedIn } = useUser();
  return (
    <Flex asChild direction="row" align="center" justify="between" style={{ width: '100%', padding: '24px 32px 0 32px', boxSizing: 'border-box' }}>
      <header>
        <Flex direction="row" align="center" justify="between" style={{ width: '100%' }}>
          <Heading size="6">LinkInBio</Heading>
          <div style={{ marginLeft: 'auto' }}>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <img
                src={DEFAULT_AVATAR}
                alt="Default avatar"
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
              />
            )}
          </div>
        </Flex>
      </header>
    </Flex>
  );
}
