// Copyright 2017-2022 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types-codec/types';
import type { HexString } from '@polkadot/util/types';

import { isHex, isU8a, u8aToU8a } from '@polkadot/util';

import { MetadataVersioned } from './MetadataVersioned';

// magic u32 preceding the version id
const VERSION_IDX = 4;

// magic + lowest supported version
const EMPTY_METADATA = new Uint8Array([0x6d, 0x65, 0x74, 0x61, 9]);

function decodeU8a (registry: Registry, value: Uint8Array): MetadataVersioned {
  const u8a = value.length === 0
    ? EMPTY_METADATA
    : value;

  try {
    return new MetadataVersioned(registry, u8a);
  } catch (error) {
    // This is an f-ing hack as a follow-up to another ugly hack
    // https://github.com/polkadot-js/api/commit/a9211690be6b68ad6c6dad7852f1665cadcfa5b2
    // when we fail on V9, try to re-parse it as v10... yes... HACK
    if (u8a[VERSION_IDX] === 9) {
      u8a[VERSION_IDX] = 10;

      return decodeU8a(registry, u8a);
    }

    throw error;
  }
}

/**
 * @name Metadata
 * @description
 * The versioned runtime metadata as a decoded structure
 */
export class Metadata extends MetadataVersioned {
  constructor (registry: Registry, value?: Uint8Array | HexString | Map<string, unknown> | Record<string, unknown>) {
    // console.time('Metadata')

    super(
      registry,
      isU8a(value)
        ? decodeU8a(registry, value)
        : isHex(value)
          ? decodeU8a(registry, u8aToU8a(value))
          : new MetadataVersioned(registry, value)
    );

    // console.timeEnd('Metadata')
  }
}
