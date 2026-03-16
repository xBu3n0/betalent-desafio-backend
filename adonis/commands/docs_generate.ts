import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { writeFile } from 'node:fs/promises'
import { generateSwaggerJson } from '#start/swagger'
import AutoSwagger from 'adonis-autoswagger'

export default class DocsGenerate extends BaseCommand {
  static commandName = 'docs:generate'
  static description = 'Generate Swagger specification files'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const document = await generateSwaggerJson()
    const yaml = AutoSwagger.default.jsonToYaml(document)

    await writeFile('swagger.json', JSON.stringify(document, null, 2))
    await writeFile('swagger.yml', yaml)

    this.logger.success('Swagger files generated at ./swagger.yml and ./swagger.json')
  }
}
