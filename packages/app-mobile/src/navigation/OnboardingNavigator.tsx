import type { Blockchain } from "@coral-xyz/common";
import type { StackScreenProps } from "@react-navigation/stack";

import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Text,
  DevSettings,
  StyleProp,
  ViewStyle,
} from "react-native";

import * as Linking from "expo-linking";

import {
  DISCORD_INVITE_LINK,
  toTitleCase,
  TWITTER_LINK,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  OnboardingProvider,
  useOnboarding,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheetHelpModal,
  HelpModalMenuButton,
} from "~components/BottomSheetHelpModal";
import {
  BaseCheckBoxLabel,
  ControlledCheckBoxLabel,
} from "~components/CheckBox";
import { ErrorMessage } from "~components/ErrorMessage";
import {
  AvalancheIcon,
  BscIcon,
  CheckBadge,
  CosmosIcon,
  DiscordIcon,
  EthereumIcon,
  PolygonIcon,
  SolanaIcon,
  TwitterIcon,
  WidgetIcon,
} from "~components/Icon";
import { StyledTextInput } from "~components/StyledTextInput";
import {
  ActionCard,
  Box,
  FullScreenLoading,
  Header,
  Margin,
  MnemonicInputFields,
  PasswordInput,
  PrimaryButton,
  LinkButton,
  Screen,
  StyledText,
  SubtextParagraph,
  WelcomeLogoHeader,
  CopyButton,
  PasteButton,
  EmptyState,
  CallToAction,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { maybeRender } from "~lib/index";

function Network({
  id,
  label,
  enabled,
  selected,
  onSelect,
}: {
  id: Blockchain;
  label: string;
  enabled: boolean;
  selected: boolean;
  onSelect: (b: Blockchain) => void;
}) {
  function getIcon(id: string): JSX.Element | null {
    switch (id) {
      case "ethereum":
        return <EthereumIcon width={32} height={32} />;
      case "solana":
        return <SolanaIcon width={32} height={32} />;
      case "polygon":
        return <PolygonIcon width={32} height={32} />;
      case "bsc":
        return <BscIcon width={32} height={32} />;
      case "cosmos":
        return <CosmosIcon width={32} height={32} />;
      case "avalanche":
        return <AvalancheIcon width={32} height={32} />;
      default:
        return null;
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ActionCard
        text={label}
        disabled={!enabled}
        icon={getIcon(id)}
        textAdornment={selected ? <CheckBadge /> : ""}
        onPress={() => {
          if (enabled) {
            onSelect(id);
          }
        }}
      />
    </View>
  );
}

type OnboardingStackParamList = {
  CreateOrImportWallet: undefined;
  OnboardingUsername: undefined;
  KeyringTypeSelector: undefined;
  MnemonicInput: undefined;
  SelectBlockchain: undefined;
  ImportAccounts: undefined;
  CreatePassword: undefined;
  OnboardingCreateAccountLoading: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

function OnboardingScreen({
  title,
  subtitle,
  children,
  style,
  scrollable,
}: {
  title: string;
  subtitle?: string;
  children?: any;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Screen
      scrollable={scrollable}
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 16,
        },
        style,
      ]}
    >
      <Margin bottom={24}>
        <Header text={title} />
        {subtitle ? <SubtextParagraph>{subtitle}</SubtextParagraph> : null}
      </Margin>
      {children}
    </Screen>
  );
}

function OnboardingCreateOrImportWalletScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "CreateOrImportWallet">) {
  const insets = useSafeAreaInsets();
  const { setOnboardingData } = useOnboarding();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePresentModalPress = () => {
    setIsModalVisible((last) => !last);
  };

  return (
    <>
      <Screen
        style={[
          styles.container,
          {
            marginTop: insets.top,
            marginBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <HelpModalMenuButton onPress={handlePresentModalPress} />
        <Margin top={48} bottom={24}>
          <WelcomeLogoHeader />
        </Margin>
        <View
          style={{
            padding: 16,
            alignItems: "center",
          }}
        >
          <PrimaryButton
            label="Create a new wallet"
            onPress={() => {
              setOnboardingData({ action: "create" });
              navigation.push("OnboardingUsername");
            }}
          />
          <LinkButton
            label="I already have a wallet"
            onPress={() => {
              setOnboardingData({ action: "import" });
              navigation.push("MnemonicInput");
            }}
          />
        </View>
      </Screen>
      <BottomSheetHelpModal
        isVisible={isModalVisible}
        resetVisibility={() => {
          setIsModalVisible(() => false);
        }}
      />
    </>
  );
}

function OnboardingKeyringTypeSelectorScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "KeyringTypeSelector">) {
  const { onboardingData, setOnboardingData } = useOnboarding();
  const { action } = onboardingData;

  return (
    <OnboardingScreen title="Keyring Selector">
      {maybeRender(action === "create", () => (
        <>
          <Header text="Create a new wallet" />
          <SubtextParagraph>
            Choose a wallet type. If you're not sure, using a recovery phrase is
            the most common option.
          </SubtextParagraph>
        </>
      ))}
      {maybeRender(action === "import", () => (
        <>
          <Header text="Import an existing wallet" />
          <SubtextParagraph>
            Choose a method to import your wallet.
          </SubtextParagraph>
        </>
      ))}
      {maybeRender(action === "recover", () => (
        <>
          <Header text="Recover a username" />
          <SubtextParagraph>
            Choose a method to recover your username.
          </SubtextParagraph>
        </>
      ))}
      <Box
        style={{
          padding: 16,
          alignItems: "center",
        }}
      >
        <PrimaryButton
          label={`${toTitleCase(action as string)} with recovery phrase`}
          onPress={() => {
            setOnboardingData({ keyringType: "mnemonic" });
            navigation.push("MnemonicInput");
          }}
        />
        <Box style={{ paddingVertical: 8 }}>
          <SubtextParagraph
            onPress={() => {
              setOnboardingData({ keyringType: "ledger" });
              navigation.push("SelectBlockchain");
            }}
          >
            {action === "recover"
              ? "Recover using a hardware wallet"
              : "I have a hardware wallet"}
          </SubtextParagraph>
        </Box>
      </Box>
    </OnboardingScreen>
  );
}

function OnboardingUsernameScreen({
  navigation,
}: StackScreenProps<
  OnboardingStackParamList,
  "OnboardingUsername"
>): JSX.Element {
  const { onboardingData, setOnboardingData } = useOnboarding();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={78}
    >
      <OnboardingScreen title="Claim your username">
        <View style={{ flex: 1 }}>
          <Margin bottom={12}>
            <SubtextParagraph>
              Others can see and find you by this username, and it will be
              associated with your primary wallet address.
            </SubtextParagraph>
          </Margin>
          <Margin bottom={12}>
            <SubtextParagraph>
              Choose wisely if you'd like to remain anonymous.
            </SubtextParagraph>
          </Margin>
          <SubtextParagraph>Have fun!</SubtextParagraph>
        </View>
        <View>
          <Margin bottom={18}>
            <StyledTextInput
              autoFocus
              placeholder="@Username"
              returnKeyType="next"
              value={onboardingData.username ?? ""}
              onChangeText={(username) => setOnboardingData({ username })}
            />
          </Margin>
          <PrimaryButton
            disabled={!onboardingData.username?.length}
            label="Continue"
            onPress={() => {
              navigation.push("MnemonicInput");
            }}
          />
        </View>
      </OnboardingScreen>
    </KeyboardAvoidingView>
  );
}

function OnboardingMnemonicInputScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "MnemonicInput">) {
  const { onboardingData, setOnboardingData } = useOnboarding();
  const { action } = onboardingData;
  const readOnly = action === "create";

  const background = useBackgroundClient();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);

  const [error, setError] = useState<string>();
  const [checked, setChecked] = useState(false);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  // Only enable copy all fields populated
  const copyEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;
  // Only allow next if checkbox is checked in read only and all fields are populated
  const nextEnabled = (!readOnly || checked) && copyEnabled;

  const subtitle = readOnly
    ? "This is the only way to recover your account if you lose your device. Write it down and store it in a safe place."
    : "Enter your 12 or 24-word secret recovery mnemonic to add an existing wallet.";

  //
  // Handle pastes of 12 or 24 word mnemonics.
  //
  useEffect(() => {
    // const onPaste = (e: any) => {
    //   const words = e.clipboardData.getData("text").split(" ");
    //   if (words.length !== 12 && words.length !== 24) {
    //     // Not a valid mnemonic length
    //     return;
    //   }
    //   // Prevent the paste from populating an individual input field with
    //   // all words
    //   e.preventDefault();
    //   setMnemonicWords(words);
    // };
    if (!readOnly) {
      // Enable pasting if not readonly
      // window.addEventListener("paste", onPaste);
    } else {
      // If read only we can generate a random mnemnic
      generateRandom();
    }
    return () => {
      if (!readOnly) {
        // window.removeEventListener("paste", onPaste);
      }
    };
  }, []);

  //
  // Validate the mnemonic and call the onNext handler.
  //
  const next = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
        params: [mnemonic],
      })
      .then((isValid: boolean) => {
        setOnboardingData({ mnemonic });
        return isValid
          ? navigation.push("SelectBlockchain")
          : setError("Invalid secret recovery phrase");
      });
  };

  //
  // Generate a random mnemonic and populate state.
  //
  const generateRandom = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
        params: [mnemonicWords.length === 12 ? 128 : 256],
      })
      .then((m: string) => {
        const words = m.split(" ");
        setMnemonicWords(words);
      });
  };

  return (
    <OnboardingScreen
      scrollable
      title="Secret recovery phrase"
      subtitle={subtitle}
    >
      <View>
        <MnemonicInputFields
          mnemonicWords={mnemonicWords}
          onChange={readOnly ? undefined : setMnemonicWords}
        />
        <Margin top={12}>
          {readOnly ? (
            <CopyButton text={mnemonicWords.join(", ")} />
          ) : (
            <PasteButton
              onPaste={(words) => {
                setMnemonicWords(words.split(" "));
              }}
            />
          )}
        </Margin>
      </View>
      <View style={{ flex: 1 }} />
      <View>
        {maybeRender(!readOnly, () => (
          <Pressable
            style={{ alignSelf: "center", marginBottom: 18 }}
            onPress={() => {
              setMnemonicWords([
                ...Array(mnemonicWords.length === 12 ? 24 : 12).fill(""),
              ]);
            }}
          >
            <Text style={{ fontSize: 18 }}>
              Use a {mnemonicWords.length === 12 ? "24" : "12"}-word recovery
              mnemonic
            </Text>
          </Pressable>
        ))}
        {maybeRender(readOnly, () => (
          <View style={{ alignSelf: "center" }}>
            <Margin bottom={18}>
              <BaseCheckBoxLabel
                label="I saved my secret recovery phrase"
                value={checked}
                onPress={() => {
                  setChecked(!checked);
                }}
              />
            </Margin>
          </View>
        ))}
        {maybeRender(Boolean(error), () => (
          <ErrorMessage for={{ message: error }} />
        ))}
        <PrimaryButton
          disabled={!nextEnabled}
          label={action === "create" ? "Next" : "Import"}
          onPress={next}
        />
        <LinkButton
          label="Start over"
          onPress={() => {
            setMnemonicWords([...Array(12).fill("")]);
          }}
        />
      </View>
    </OnboardingScreen>
  );
}

function OnboardingBlockchainSelectScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "SelectBlockchain">) {
  const { onboardingData, handleSelectBlockchain } = useOnboarding();
  const { blockchainOptions, selectedBlockchains } = onboardingData;
  const numColumns = 2;
  const gap = 8;

  return (
    <OnboardingScreen
      title="Which network would you like Backpack to use?"
      subtitle="You can always add additional networks later through the settings menu."
    >
      <FlatList
        numColumns={numColumns}
        data={blockchainOptions}
        keyExtractor={(item) => item.id}
        extraData={selectedBlockchains}
        scrollEnabled={false}
        initialNumToRender={blockchainOptions.length}
        contentContainerStyle={{ gap }}
        columnWrapperStyle={{ gap }}
        renderItem={({ item }) => {
          return (
            <Network
              id={item.id as Blockchain}
              selected={selectedBlockchains.includes(item.id as Blockchain)}
              enabled={item.enabled}
              label={item.label}
              onSelect={async (blockchain) =>
                await handleSelectBlockchain({
                  blockchain,
                  // onSelectImport: () => {
                  //   console.log("import");
                  // },
                })
              }
            />
          );
        }}
      />
      <PrimaryButton
        disabled={selectedBlockchains.length === 0}
        label="Next"
        onPress={() => {
          navigation.push("CreatePassword");
        }}
      />
    </OnboardingScreen>
  );
}

type CreatePasswordFormData = {
  password: string;
  passwordConfirmation: string;
  agreedToTerms: boolean;
};

function OnboardingCreatePasswordScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "CreatePassword">) {
  const { setOnboardingData } = useOnboarding();

  const { control, handleSubmit, formState, watch } =
    useForm<CreatePasswordFormData>();
  const { errors, isValid } = formState;

  const onSubmit = ({ password }: CreatePasswordFormData) => {
    setOnboardingData({ password, complete: true });
    navigation.push("OnboardingCreateAccountLoading");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={78}
    >
      <OnboardingScreen
        title="Create a password"
        subtitle="It should be at least 8 characters. You'll need this to unlock Backpack."
      >
        <View style={{ flex: 1, justifyContent: "flex-start" }}>
          <Margin bottom={12}>
            <PasswordInput
              autoFocus
              name="password"
              placeholder="Password"
              control={control}
              returnKeyType="next"
              rules={{
                required: "You must specify a password",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }}
            />
            <ErrorMessage for={errors.password} />
          </Margin>
          <PasswordInput
            name="passwordConfirmation"
            placeholder="Confirm Password"
            returnKeyType="done"
            control={control}
            rules={{
              validate: (val: string) => {
                if (val !== watch("password")) {
                  return "Passwords do not match";
                }
              },
            }}
          />
          <ErrorMessage for={errors.passwordConfirmation} />
        </View>

        <View style={{ alignSelf: "center" }}>
          <Margin bottom={18}>
            <ControlledCheckBoxLabel
              name="agreedToTerms"
              control={control}
              label="I agree to the terms of service"
            />
            <ErrorMessage for={errors.agreedToTerms} />
          </Margin>
        </View>
        <PrimaryButton
          disabled={!isValid}
          label="Next"
          onPress={handleSubmit(onSubmit)}
        />
      </OnboardingScreen>
    </KeyboardAvoidingView>
  );
}

// TODO(peter) import flow OnboardingAccount/ImportAccounts
function OnboardingImportAccountsScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "ImportAccounts">) {
  // const { onboardingData} = useOnboarding();
  // const { mnemonic, blockchain } = onboardingData;
  // const allowMultiple = false;

  return (
    <Screen style={styles.container}>
      <View>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Secret Recovery Phrase
        </StyledText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <PrimaryButton
          label="Import Accounts"
          onPress={() => {
            navigation.push("CreatePassword");
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingCreateAccountLoadingScreen(
  _p: StackScreenProps<
    OnboardingStackParamList,
    "OnboardingCreateAccountLoading"
  >
): JSX.Element {
  const background = useBackgroundClient();
  const { onboardingData, maybeCreateUser } = useOnboarding();
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      // This is a mitigation to ensure the keyring store doesn't lock before
      // creating the user on the server.
      //
      // Would be better (though probably not a priority atm) to ensure atomicity.
      // E.g. we could generate the UUID here on the client, create the keyring store,
      // and only then create the user on the server. If the server fails, then
      // rollback on the client.
      //
      // An improvement for the future!
      if (onboardingData.isAddingAccount) {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
          params: [],
        });
      }
      const res = await maybeCreateUser({ ...onboardingData });
      if (!res.ok) {
        setError(true);
      }
    })();
  }, [onboardingData, background, maybeCreateUser]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <EmptyState
          icon={(props: any) => <MaterialIcons name="error" {...props} />}
          title="Something went wrong."
          subtitle="Please get in touch ASAP or try again"
          buttonText="Start Over"
          onPress={() => {
            DevSettings.reload();
          }}
        />
      </View>
    );
  }

  return <FullScreenLoading label="Creating your wallet..." />;
}

export function OnboardingCompleteWelcome({
  onComplete,
}: {
  onComplete: (path: string) => void;
}): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <OnboardingScreen
      title="You've set up Backpack!"
      subtitle="We recommend downloading a few xNFTs to get started."
      style={{
        paddingTop: insets.top + 36,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View>
        <Margin bottom={8}>
          <CallToAction
            icon={<WidgetIcon />}
            title="Browse the xNFT library"
            onPress={() => Linking.openURL(XNFT_GG_LINK)}
          />
        </Margin>
        <Margin bottom={8}>
          <CallToAction
            icon={<TwitterIcon />}
            title="Follow us on Twitter"
            onPress={() => Linking.openURL(TWITTER_LINK)}
          />
        </Margin>
        <CallToAction
          icon={<DiscordIcon />}
          title="Join the Discord"
          onPress={() => Linking.openURL(DISCORD_INVITE_LINK)}
        />
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton
        disabled={false}
        label="Finish"
        onPress={() => {
          onComplete("finished");
        }}
      />
    </OnboardingScreen>
  );
}

export function OnboardingNavigator({
  onStart,
}: {
  onStart: (path: string) => void;
}): JSX.Element {
  useEffect(() => {
    onStart("onboarding");
  }, [onStart]);

  const theme = useTheme();
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="CreateOrImportWallet"
          component={OnboardingCreateOrImportWalletScreen}
        />
        <Stack.Group
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.custom.colors.background,
              shadowColor: "transparent",
            },
            headerTintColor: theme.custom.colors.fontColor,
            headerTitle: "",
            headerShown: true,
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen
            name="KeyringTypeSelector"
            component={OnboardingKeyringTypeSelectorScreen}
          />
          <Stack.Screen
            name="OnboardingUsername"
            component={OnboardingUsernameScreen}
          />
          <Stack.Screen
            name="MnemonicInput"
            component={OnboardingMnemonicInputScreen}
          />
          <Stack.Screen
            name="SelectBlockchain"
            component={OnboardingBlockchainSelectScreen}
          />
          <Stack.Screen
            name="ImportAccounts"
            component={OnboardingImportAccountsScreen}
          />
          <Stack.Screen
            name="CreatePassword"
            component={OnboardingCreatePasswordScreen}
          />
          <Stack.Screen
            name="OnboardingCreateAccountLoading"
            component={OnboardingCreateAccountLoadingScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
});
