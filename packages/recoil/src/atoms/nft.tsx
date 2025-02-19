import type { Nft, NftCollection } from "@coral-xyz/common";
import {
  Blockchain,
  EnrichedNotification,
  fetchXnftsFromPubkey,
} from "@coral-xyz/common";
import {
  selector,
  selectorFamily,
  useRecoilValue,
  useRecoilValueLoadable,
  waitForAll,
} from "recoil";

import { equalSelectorFamily } from "../equals";

import { ethereumNftById, ethereumWalletCollections } from "./ethereum/nft";
import { ethereumConnectionUrl } from "./ethereum";
import {
  anchorContext,
  solanaConnectionUrl,
  solanaNftById,
  solanaWalletCollections,
} from "./solana";
import { allWallets, allWalletsDisplayed } from "./wallet";

export const nftCollectionsWithIds = selector<
  Array<{
    publicKey: string;
    collections: Array<NftCollection>;
  }>
>({
  key: "nftCollectionsWithIds",
  get: ({ get }) => {
    const wallets = get(allWalletsDisplayed);
    const allWalletCollections = get(
      waitForAll(
        wallets.map(({ blockchain, publicKey }) => {
          if (blockchain === Blockchain.SOLANA) {
            return solanaWalletCollections({ publicKey });
          } else {
            return ethereumWalletCollections({ publicKey });
          }
        })
      )
    );
    return allWalletCollections;
  },
});

export const nftById = equalSelectorFamily<
  Nft,
  { publicKey: string; connectionUrl: string; nftId: string }
>({
  key: "nftById",
  get:
    ({ publicKey, connectionUrl, nftId }) =>
    ({ get }) => {
      const wallets = get(allWallets);
      const { blockchain } = wallets.find((w) => w.publicKey === publicKey)!;
      if (blockchain === Blockchain.SOLANA) {
        return get(solanaNftById({ publicKey, connectionUrl, nftId }));
      } else {
        return get(ethereumNftById({ publicKey, connectionUrl, nftId }));
      }
    },
  equals: (m1, m2) => JSON.stringify(m1) === JSON.stringify(m2),
});

export const nftsByOwner = selectorFamily<
  { nfts: Array<Nft> },
  {
    publicKey: string;
    blockchain: Blockchain;
  }
>({
  key: "nftsByOwner",
  get:
    ({
      publicKey,
      blockchain,
    }: {
      publicKey: string;
      blockchain: Blockchain;
    }) =>
    async ({ get }: any) => {
      try {
        const nftCollections =
          blockchain === Blockchain.SOLANA
            ? get(solanaWalletCollections({ publicKey }))
            : get(ethereumWalletCollections({ publicKey }));
        const connectionUrl =
          blockchain === Blockchain.ETHEREUM
            ? get(ethereumConnectionUrl)
            : get(solanaConnectionUrl);
        const allItems: string[] = [];
        nftCollections?.collections?.map((x) =>
          x.itemIds?.map((nftId) => allItems.push(nftId))
        );
        const allNfts = get(
          waitForAll(
            allItems.map((id) => {
              return nftById({ publicKey, connectionUrl, nftId: id });
            })
          )
        );
        return allNfts;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
});

export const nftsByIds = selectorFamily<
  { nfts: Array<Nft> },
  {
    nftIds: { nftId: string; publicKey: string }[];
    blockchain: Blockchain;
  }
>({
  key: "nftsByIds",
  get:
    ({
      nftIds,
      blockchain,
    }: {
      nftIds: { nftId: string; publicKey: string }[];
      blockchain: Blockchain;
    }) =>
    async ({ get }: any) => {
      const connectionUrl =
        blockchain === Blockchain.ETHEREUM
          ? get(ethereumConnectionUrl)
          : get(solanaConnectionUrl);

      try {
        const allNfts = get(
          waitForAll(
            nftIds.map(({ nftId, publicKey }) => {
              if (blockchain === Blockchain.SOLANA) {
                return get(solanaNftById({ publicKey, connectionUrl, nftId }));
              } else {
                return get(
                  ethereumNftById({ publicKey, connectionUrl, nftId })
                );
              }
            })
          )
        );
        return allNfts;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
});
