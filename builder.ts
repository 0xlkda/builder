import { BuilderService } from './builder.service'

interface Sample {
  fi: string,
  la: number,
  do: boolean,
}

const sample = BuilderService.createBuilder<Sample>()
  .set('fi', 'FI')
  .set('la', 6)
  .set('do', true)
  .build()

expect(sample).toEqual({
  fi: 'FI',
  la: 6,
  do: true,
})
