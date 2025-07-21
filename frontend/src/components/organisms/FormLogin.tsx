import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import classes from '../../styles/AuthenticationImage.module.css';

export function AuthenticationImage() {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome back to Nutroos!
        </Title>

        <TextInput label="Email address" placeholder="hello@gmail.com" size="md" radius="md" />
        <PasswordInput label="Password" placeholder="Your password" mt="md" size="md" radius="md" />
        <Checkbox label="Keep me logged in" mt="xl" size="md" />
        <Button fullWidth mt="xl" size="md" radius="md">
          Login
        </Button>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{' '}
          <Anchor href="/register" fw={500} onClick={(event) => event.preventDefault()}>
            Register  
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}

export default AuthenticationImage;