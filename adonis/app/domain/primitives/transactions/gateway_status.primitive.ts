import { GatewayStatusEnum, type GatewayStatusEnum as GatewayStatusValue } from '#domain/enums/transactions/gateway_status.enum'

export class GatewayStatus {
  private constructor(public readonly value: GatewayStatusValue) {}

  public static create(value: GatewayStatusValue): GatewayStatus {
    return new GatewayStatus(value)
  }

  public static active(): GatewayStatus {
    return new GatewayStatus(GatewayStatusEnum.ACTIVE)
  }

  public static inactive(): GatewayStatus {
    return new GatewayStatus(GatewayStatusEnum.INACTIVE)
  }

  public isActive(): boolean {
    return this.value === GatewayStatusEnum.ACTIVE
  }

  public isInactive(): boolean {
    return this.value === GatewayStatusEnum.INACTIVE
  }
}
