/**
 * Type definitions for Zerion API responses
 */

export interface Chain {
  id: string
  type: "chains"
  attributes: {
    external_id: string
    name: string
    icon_url?: string
    is_testnet: boolean
  }
}

export interface FungibleAsset {
  id: string
  type: "fungibles"
  attributes: {
    name: string
    symbol: string
    icon_url?: string
    implementations: {
      chain_id: string
      address: string | null
      decimals: number
    }[]
    market_data?: {
      price: number
      total_supply: number
      market_cap: number
      fully_diluted_valuation: number
      price_change_24h: number
    }
  }
}

export interface Position {
  id: string
  type: "positions"
  attributes: {
    parent: string | null
    protocol: string | null
    name: string
    position_type: string
    quantity: {
      int: string
      decimals: number
      float: number
      numeric: string
    }
    value: number | null
    price: number | null
    changes: {
      absolute_1d: number | null
      percent_1d: number | null
    } | null
    fungible_info: {
      name: string
      symbol: string
      icon: {
        url: string
      } | null
      flags: {
        verified: boolean
      }
      implementations: {
        chain_id: string
        address: string
        decimals: number
      }[]
    }
    flags: {
      displayable: boolean
      is_trash: boolean
    }
    updated_at: string
    updated_at_block: number | null
  }
  relationships: {
    chain: {
      links: {
        related: string
      }
      data: {
        type: "chains"
        id: string
      }
    }
    fungible: {
      links: {
        related: string
      }
      data: {
        type: "fungibles"
        id: string
      }
    }
  }
}

export interface WalletPortfolio {
  id: string
  type: "portfolio"
  attributes: {
    positions_distribution_by_type: Record<string, number>
    positions_distribution_by_chain: Record<string, number>
    total: {
      positions: number
    }
    changes: {
      absolute_1d: number
      percent_1d: number
    }
  }
}

export interface ChartDataPoint {
  timestamp: number
  value: number
}

export interface FungibleChart {
  data: {
    id: string
    type: "fungible-charts"
    attributes: {
      begin_at: string
      end_at: string
      stats: {
        min: number
        max: number
        diff: number
      }
      points: ChartDataPoint[]
    }
  }
}

export interface ZerionListResponse<T> {
  data: T[]
  links?: {
    self?: string
    next?: string
    prev?: string
  }
}

export interface ZerionSingleResponse<T> {
  data: T
  links?: {
    self?: string
  }
}

export interface Transaction {
  id: string
  type: "transactions"
  attributes: {
    address: string
    operation_type: string
    hash: string
    mined_at_block: number
    mined_at: string
    sent_from: string
    sent_to: string
    status: string
    nonce: number
    fee: {
      fungible_info: {
        id: string
        name: string
        symbol: string
        icon: {
          url: string
        }
        flags: {
          verified: boolean
        }
        implementations: {
          chain_id: string
          address: string
          decimals: number
        }[]
      }
      quantity: {
        int: string
        decimals: number
        float: number
        numeric: string
      }
      price: number
      value: number
    }
    transfers: {
      fungible_info: {
        id: string
        name: string
        symbol: string
        icon: {
          url: string
        }
        flags: {
          verified: boolean
        }
        implementations: {
          chain_id: string
          address: string
          decimals: number
        }[]
      }
      direction: "in" | "out"
      quantity: {
        int: string
        decimals: number
        float: number
        numeric: string
      }
      value: number | null
      price: number | null
      sender: string
      recipient: string
      act_id: string
    }[]
    approvals: any[]
    flags: {
      is_trash: boolean
    }
    acts: {
      id: string
      type: string
      application_metadata?: {
        contract_address?: string
      }
    }[]
  }
  relationships: {
    chain: {
      links: {
        related: string
      }
      data: {
        type: "chains"
        id: string
      }
    }
  }
}
